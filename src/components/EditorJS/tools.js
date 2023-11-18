
import Embed from '@editorjs/embed'
import Table from '@editorjs/table'
import List from '@editorjs/list'
import Header from '@editorjs/header'
import Quote from '@editorjs/quote'
import Marker from '@editorjs/marker'
import CheckList from '@editorjs/checklist'
import InlineCode from '@editorjs/inline-code'
import Warning from './Warning';
import Success from './Success'
import Error from './Error';
import Info from './Info';
import Divider from './Divider';
import LineBreak from './LineBreak';
import Hyperlink from 'editorjs-hyperlink';
import CodeEditor from './CodeEditor'

const EDITOR_JS_TOOLS = {
  // NOTE: Paragraph is default tool. Declare only when you want to change paragraph option.
  checklist: {
    inlineToolbar: true,
    class: CheckList
  },
  code: CodeEditor,
  divider: Divider,
	linebreak: LineBreak,
  embed: {
    class: Embed,
    inlineToolbar: false,
    config: {
      services: {
        youtube: true,
        codepen: true,
        instagram: true,
        imgur: true,
        twitter: true
      }
    }
  },
  header: {
    inlineToolbar: true,
    class: Header,
    config: {
      placeholder: 'Enter your content here...'
    }
  },
  inlineCode: InlineCode,
  hyperlink: {
    class: Hyperlink
  },
  list: List,
  marker: {
    inlineToolbar: true,
    class: Marker
  },
  quote: {
    inlineToolbar: true,
    class: Quote
  },
  table: {
    inlineToolbar: true,
    class: Table
  },
  warning: {
    inlineToolbar: true,
    class: Warning
  },
  info: {
    inlineToolbar: true,
    class: Info
  },
  success: {
    inlineToolbar: true,
    class: Success
  },
  error: {
    inlineToolbar: true,
    class: Error
  }
};


export default EDITOR_JS_TOOLS;