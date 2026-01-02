const fs = require('fs');
const vm = require('vm');

try {
    const code = fs.readFileSync('server.js', 'utf8');
    new vm.Script(code, { filename: 'server.js' });
    const msg = "Syntax is OK.\n";
    console.log(msg);
    fs.writeFileSync('syntax_error.log', msg);
} catch (e) {
    const msg = `SYNTAX ERROR DETECTED:
${e.message}
Line: ${e.lineNumber || '?'}
Stack: ${e.stack}
`;
    console.error(msg);
    fs.writeFileSync('syntax_error.log', msg);
}
