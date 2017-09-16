import path from 'path';
import fs from 'fs-extra';
import tempy from 'tempy';
import execa from 'execa';
import pEachSeries from 'p-each-series';

/**
 * Create a temporary git repository with commits.
 *
 * @method commits
 * @param {Array<string>} messages the commit message (1 commit per message).
 */
export default async function commits(messages) {
  const dir = tempy.directory();

  fs.symlink(path.resolve('./node_modules'), path.join(dir, 'node_modules'));
  process.chdir(dir);
  await fs.mkdir('git-templates');
  await execa('git', ['init', '--template=./git-templates']);

  await pEachSeries(messages, message => execa('git', ['commit', '-m', message, '--allow-empty', '--no-gpg-sign']));
}
