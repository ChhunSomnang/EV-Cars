import React from "react";

interface CodeSnippetProps {
  title: string;
  code: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ title, code }) => {
    console.log("Rendering CodeSnippet:", title, code); // Log the props
    return (
      <div className="code-snippet-container">
        <h3 className="code-snippet-title">{title}</h3>
        <pre className="code-snippet">
          <code>{code}</code>
        </pre>
      </div>
    );
};

export default CodeSnippet;
