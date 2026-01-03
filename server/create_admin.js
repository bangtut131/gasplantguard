const supabase = require('./database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    if (!supabase) {
        console.error("Supabase client not initialized. Check .env variables.");
        return;
    }

    const username = 'admin';
    const password = 'admin123'; // Default password
    const hashedPassword = bcrypt.hashSync(password, 10);

    console.log(`Creating admin user: ${username} / ${password}...`);

    const { data, error } = await supabase
        .from('users')
        .upsert({
            username: username,
            password: hashedPassword,
            role: 'admin',
            created_at: new Date().toISOString()
        }, { onConflict: 'username' })
        .select();

    if (error) {
        console.error("Error creating admin:", error.message);
    } else {
        console.log("Admin user created successfully!");
        console.log("-----------------------------------------");
        console.log("Username: " + username);
        console.log("Password: " + password);
        console.log("-----------------------------------------");
    }
}

createAdmin();
