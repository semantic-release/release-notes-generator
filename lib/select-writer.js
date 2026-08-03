import writerV8 from "../wrappers/conventional-changelog-writer.js";
import writerV9 from "../wrappers/conventional-changelog-writer-v9.js";

/**
 * Select the `conventional-changelog-writer` version compatible with the loaded preset's `writerOpts`.
 *
 * `conventional-changelog-writer@9` replaced its Handlebars-string templates (`mainTemplate`, `headerPartial`, etc.) with plain render functions, and renamed the root template option from `mainTemplate` to `template`. Presets built against the old writer (e.g. `conventional-changelog-angular@8`) never set `writerOpts.template`; presets built against the new writer (e.g. `conventional-changelog-conventionalcommits@10`) always do, as a function. The two are mutually exclusive, so this is a reliable dispatch key without needing the preset to declare its own writer version explicitly.
 *
 * @param {Object} writerOpts The resolved writer options from `loadChangelogConfig`.
 * @return {Function} The `writeChangelogString` implementation matching `writerOpts`' own template architecture.
 */
export default function selectWriter(writerOpts) {
  return typeof writerOpts.template === "function" ? writerV9 : writerV8;
}
