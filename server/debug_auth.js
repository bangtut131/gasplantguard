const db = require('./database');
const bcrypt = require('bcryptjs');

console.log('--- Inspecting Users Table ---');
try {
    const users = db.prepare('SELECT * FROM users').all();
    console.log('Total users:', users.length);

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    console.log('Admin user found:', user ? 'YES' : 'NO');

    if (user) {
        console.log('User ID:', user.id);
        console.log('Username:', user.username);
        console.log('Stored Hash:', user.password);
        console.log('Role:', user.role);

        const testPass = 'admin123';
        const isMatch = bcrypt.compareSync(testPass, user.password);
        console.log(`Testing '${testPass}' against stored hash:`, isMatch ? 'MATCH (Valid)' : 'MISMATCH (Invalid)');

        if (!isMatch) {
            console.log('Attempting to fix hash manually...');
            const newHash = bcrypt.hashSync(testPass, 10);
            db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, user.id);
            console.log('Password updated.');

            const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
            const retryMatch = bcrypt.compareSync(testPass, updatedUser.password);
            console.log(`Retest '${testPass}':`, retryMatch ? 'MATCH (Fixed)' : 'STILL FAILING');
        }
    } else {
        console.log('Admin user missing! Creating...');
        const hash = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
        console.log('Admin user created.');
    }
} catch (e) {
    console.error('Error:', e);
}
