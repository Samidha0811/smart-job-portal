const db = require('../config/db');

async function migrate() {
    try {
        // Check if column exists first for better compatibility
        const [columns] = await db.query("SHOW COLUMNS FROM jobs LIKE 'experience_required'");
        if (columns.length === 0) {
            await db.query('ALTER TABLE jobs ADD COLUMN experience_required INT DEFAULT 0 AFTER location');
            console.log('Migration completed: experience_required column added to jobs table.');
        } else {
            console.log('Migration skipped: experience_required column already exists.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
