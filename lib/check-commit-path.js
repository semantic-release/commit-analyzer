export async function checkCommitPath(hash, path) {
    console.log("checkig commit path", hash, path);
    const releventChanges = await execa(["git", "diff", `${hash}^!`, path]).stdout;
    console.log("check returns", releventChanges.length > 0):   
    return releventChanes.length > 0
}