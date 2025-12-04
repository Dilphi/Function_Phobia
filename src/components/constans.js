// components/constans.js
export const LANGUAGE_VERSIONS = {
    javascript: '18.15.0',
    python: '3.10.0',
    java: '15.0.2',
    cpp: '10.2.0',
};

export const CODE_SNIPPETS = {
    javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet('World');\n`,
    python: `def greet(name):\n\tprint(f"Hello, {name}!")\n\ngreet("World")\n`,
    java: `public class Main {\n\tpublic static void greet(String name) {\n\t\tSystem.out.println("Hello, " + name + "!");\n\t}\n\n\tpublic static void main(String[] args) {\n\t\tgreet("World");\n\t}\n}\n`,
    cpp: `#include <iostream>\n\nvoid greet(const std::string& name) {\n\tstd::cout << "Hello, " << name << "!" << std::endl;\n}\n\nint main() {\n\tgreet("World");\n\treturn 0;\n}\n`,
}