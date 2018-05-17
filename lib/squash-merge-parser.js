const SQUASH_MERGE_COMMIT_HEADER = /^commit [a-f0-9]*$/;
const SQUASH_MERGE_AUTHOR_HEADER = /^Author: .*$/;
const SQUASH_MERGE_DATE_HEADER = /^Date: .*$/;
const SQUASH_MERGE_INDENT = '    ';

function findNextSquashCommit(lines, currentLine) {
  while (lines[currentLine] === '' && currentLine < lines.length) {
    currentLine++;
  }

  if (currentLine >= lines.length) {
    return {result: 'done'};
  }

  const commit = SQUASH_MERGE_COMMIT_HEADER.exec(lines[currentLine++]);
  const author = SQUASH_MERGE_AUTHOR_HEADER.exec(lines[currentLine++]);
  const date = SQUASH_MERGE_DATE_HEADER.exec(lines[currentLine++]);
  if (!(commit && author && date)) {
    return {result: 'error'};
  }

  let message = '';
  while (
    currentLine < lines.length &&
    (lines[currentLine] === '' || lines[currentLine].startsWith(SQUASH_MERGE_INDENT))
  ) {
    message += `${lines[currentLine].slice(SQUASH_MERGE_INDENT.length)}\n`;
    currentLine++;
  }

  return {result: 'found', message: message.trim(), currentLine};
}

/**
 * A squash merge may have several commits masquerading as one.  This splits up
 * the commit message into an array of commits.  If the commit is not a squash
 * merge, returns `undefined`.
 *
 * @param {Object} commit - The commit.
 * @returns {Array | undefiend} - Array of commits, or `undefined`
 *   if this is not a squash merge.
 */
module.exports = function(commit) {
  let answer;

  const lines = commit.message.split(/\r|\n/);
  if (lines[0] === 'Squashed commit of the following:') {
    debugger;
    let success = true;
    const commits = [];

    let currentLine = 1;
    while (currentLine < lines.length) {
      const nextCommit = findNextSquashCommit(lines, currentLine);
      switch (nextCommit.result) {
        case 'found':
          commits.push({
            message: nextCommit.message,
            squash: true
          });
          ({currentLine} = nextCommit);
          break;
        case 'done':
          currentLine = lines.length;
          break;
        case 'error':
          success = false;
          currentLine = lines.length;
          break;
        default:
          throw new Error(`Unhandled case ${nextCommit.result}`);
      }
    }

    if (success) {
      answer = commits;
    }
  }

  return answer;
};
