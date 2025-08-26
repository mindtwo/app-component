import { consola } from 'consola';
import { inc } from 'semver';
import { getLatestTag } from './_utils';

async function main() {
    const currentVersion = await getLatestTag();
    const newVersion = currentVersion;
    if (!newVersion) {
        throw new Error('No version found. Please provide version!');
    }

    // Set Version in current environment
    const nextVersion = inc(newVersion, 'patch');

    // Export the next version
    console.log(nextVersion);
}

main().catch((err) => {
    consola.error(err);
    process.exit(1);
});
