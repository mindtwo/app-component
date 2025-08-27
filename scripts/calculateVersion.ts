import { consola } from 'consola';
import { inc } from 'semver';
import { getLatestTag } from './_utils';

async function main() {
    const currentVersion = await getLatestTag();
    const newVersion = currentVersion;
    if (!newVersion) {
        throw new Error('No version found. Please provide version!');
    }

    let bumpType = process.argv[2] || 'patch';

    if (!['major', 'minor', 'patch'].includes(bumpType)) {
        bumpType = 'patch';
    }

    // Set Version in current environment
    const nextVersion = inc(newVersion, bumpType);

    // Export the next version
    console.log(nextVersion);
}

main().catch((err) => {
    consola.error(err);
    process.exit(1);
});
