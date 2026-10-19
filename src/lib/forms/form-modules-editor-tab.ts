/** Table-column-only forms open on Tables instead of an empty Layout tab. */
export function getDefaultFormModulesEditorTab(
  supportsTableColumns: boolean,
  fieldCount: number,
  showTablesEditorTab: boolean,
): 'layout' | 'summary' | 'tables' {
  if (supportsTableColumns && fieldCount === 0 && showTablesEditorTab) {
    return 'tables';
  }

  return 'layout';
}
