// Import React dependencies.
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Slate, Editable, withReact, ReactEditor, useSlate } from 'slate-react'
import { createEditor, Editor, Transforms, BaseEditor, Descendant } from 'slate'

type CustomElement = { type: 'paragraph' | 'code'; children: CustomText[] }
type CustomText = { text: string; bold: boolean }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

// test code block
const CodeElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

// test leaf
const Leaf = (props: { attributes: any; children: any; leaf: any }) => {
  if (props.leaf.bold) {
    return (
      <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}>
        {props.children}
      </span>
    )
  }

  if (props.leaf.code) {
    return <code {...props.attributes}>{props.children}</code>
  }

  if (props.leaf.italic) {
    return <p {...props.attributes}>{props.children}</p>
  }

  if (props.leaf.underline) {
    return <u {...props.attributes}>{props.children}</u>
  }

  return <span {...props.attributes}>{props.children}</span>
}

const TestSlate = () => {
  // states
  const [editor] = useState(() => withReact(createEditor()))
  const [slateEditorValue, setSlateEditorValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.', bold: false }],
    },
  ])

  // get initial value from database
  useEffect(() => {
    const x: Descendant[] = JSON.parse(localStorage.getItem('content') ?? '') || [
      {
        type: 'paragraph',
        children: [{ text: 'A line of text in a paragraph.' }],
      },
    ]
    Transforms.deselect(editor)
    editor.children = x
    Transforms.select(editor, Editor.end(editor, []))
  }, [])

  // render element as different blocks
  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <div {...props} />
    }
  }, [])

  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])

  return (
    <div>
      test slate
      {/* toolbar */}
      <button
        onMouseDown={(event) => {
          event.preventDefault()
          Editor.addMark(editor, 'bold', true)
        }}
      >
        bold
      </button>
      <button
        onMouseDown={(event) => {
          event.preventDefault()
          Transforms.insertNodes(editor, { type: 'code', children: [{ text: '', bold: false }] })
        }}
      >
        code
      </button>
      {/* editor */}
      <Slate
        editor={editor}
        value={slateEditorValue}
        onChange={(value) => {
          // check if operation is not selection
          const madeChanges = editor.operations.some((op) => 'set_selection' !== op.type)

          // store changes into local storage
          if (madeChanges) {
            const content = JSON.stringify(value)

            console.log('changes: ', value)
            setSlateEditorValue(value)
            localStorage.setItem('content', content)
          }
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (event.key === '`' && event.ctrlKey) {
              // prevent '`' from inserting into slate
              event.preventDefault()

              Transforms.insertNodes(
                editor,
                { type: 'code', children: [{ text: '', bold: false }] },
                { at: [editor.children.length] }
              )
              Transforms.select(editor, {
                anchor: Editor.start(editor, [editor.children.length - 1]),
                focus: Editor.end(editor, [editor.children.length - 1]),
              })
              // Transforms.setNodes(editor, { type: 'code' }, { match: (n) => Editor.isBlock(editor, n) })
            }
          }}
        />
      </Slate>
    </div>
  )
}

export default TestSlate
