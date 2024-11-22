declare module 'editorconfig' {
  interface EditorConfig {
    charset?: string;
    end_of_line?: 'lf' | 'crlf' | 'cr';
    indent_size?: number;
    indent_style?: 'tab' | 'space';
    insert_final_newline?: boolean;
    max_line_length?: number;
    tab_width?: number;
    trim_trailing_whitespace?: boolean;
    [key: string]: any;
  }

  function parseSync(filePath: string): EditorConfig | undefined;

  export { parseSync, EditorConfig };
}
