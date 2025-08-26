import { promises as fsp } from 'fs';
import { resolve } from 'path';
import { glob } from 'tinyglobby';
import { exec } from 'tinyexec';

export interface Dep {
    name: string;
    range: string;
    type: string;
}

type Package = {
    dir: string;
    data: {
        name: string;
        version?: string;
        [key: string]: any;
    };
    save: () => Promise<void>;
    updateDeps: (reviver: (dep: Dep) => Dep | void) => void;
};

type Workspace = {
    dir: string;
    workspacePkg: Package;
    packages: Package[];
    save: () => Promise<unknown[]>;
    find: (name: string) => Package;
    rename: (from: string, to: string) => void;
    setVersion: (name: string, newVersion: string, opts?: { updateDeps?: boolean }) => void;
};

export async function loadPackage(dir: string): Promise<Package> {
    const pkgPath = resolve(dir, 'package.json');
    const data = JSON.parse(await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'));
    const save = () => fsp.writeFile(pkgPath, JSON.stringify(data, null, 2) + '\n');

    const updateDeps = (reviver: (dep: Dep) => Dep | void) => {
        for (const type of [
            'dependencies',
            'devDependencies',
            'optionalDependencies',
            'peerDependencies',
        ]) {
            if (!data[type]) {
                continue;
            }
            for (const e of Object.entries(data[type])) {
                const dep: Dep = { name: e[0], range: e[1] as string, type };
                delete data[type][dep.name];
                const updated = reviver(dep) || dep;
                data[updated.type] ||= {};
                data[updated.type][updated.name] = updated.range;
            }
        }
    };

    return {
        dir,
        data,
        save,
        updateDeps,
    };
}

export async function loadWorkspace(root: string): Promise<Workspace> {
    const workspacePkg = await loadPackage(root);
    const pkgDirs = (await glob(['packages/*', 'docs'], { onlyDirectories: true })).sort();

    const packages: Package[] = [];

    for (const pkgDir of pkgDirs) {
        const pkg = await loadPackage(pkgDir);
        if (!pkg.data.name) {
            continue;
        }
        packages.push(pkg);
    }

    const find = (name: string) => {
        const pkg = packages.find((pkg) => pkg.data.name === name);
        if (!pkg) {
            throw new Error('Workspace package not found: ' + name);
        }
        return pkg;
    };

    const rename = (from: string, to: string) => {
        find(from).data._name = find(from).data.name;
        find(from).data.name = to;
        for (const pkg of packages) {
            pkg.updateDeps((dep) => {
                if (dep.name === from && !dep.range.startsWith('npm:')) {
                    dep.range = 'npm:' + to + '@' + dep.range;
                }
            });
        }
    };

    const setVersion = (name: string, newVersion: string, opts: { updateDeps?: boolean } = {}) => {
        find(name).data.version = newVersion;
        if (!opts.updateDeps) {
            return;
        }

        for (const pkg of packages) {
            pkg.updateDeps((dep) => {
                if (dep.name === name) {
                    dep.range = newVersion;
                }
            });
        }
    };

    const save = () => Promise.all(packages.map((pkg) => pkg.save()));

    return {
        dir: root,
        workspacePkg,
        packages,
        save,
        find,
        rename,
        setVersion,
    };
}

export async function getLatestTag() {
    const { stdout: latestTag } = await exec('git', ['describe', '--tags', '--abbrev=0']);
    return latestTag.trim();
}

export async function getLatestReleasedTag() {
    const latestReleasedTag = await exec('git', ['tag', '-l'])
        .then((r) =>
            r.stdout
                .trim()
                .split('\n')
                .filter((t) => /v3\.\d+\.\d+/.test(t))
                .sort(compare)
        )
        .then((r) => r.pop()!.trim());
    return latestReleasedTag;
}
