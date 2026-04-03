const db = require('../config/db');

const Seeker = {
    /**
     * Create or update seeker details with transaction support
     */
    async createOrUpdateDetails(details) {
        const {
            user_id, full_name, email, phone, location, current_job_title, current_company,
            total_experience_years, total_experience_months, industry, functional_area,
            resume_path, profile_summary, preferred_location, expected_salary, job_type,
            desired_role, preferred_industry, shift_preference, actively_looking,
            profile_visibility, profile_photo,
            education, experience, skills, projects, languages, certifications
        } = details;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Update/Insert into job_seeker_profiles
            const [existing] = await connection.query('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [user_id]);
            let profileId;

            const profileData = [
                user_id, full_name, email, phone, location, current_job_title, current_company,
                total_experience_years, total_experience_months, industry, functional_area,
                resume_path, profile_summary, preferred_location, expected_salary, job_type,
                desired_role, preferred_industry, shift_preference, actively_looking,
                profile_visibility, profile_photo
            ];

            if (existing.length > 0) {
                profileId = existing[0].id;
                await connection.query(
                    `UPDATE job_seeker_profiles SET 
                        full_name = ?, email = ?, phone = ?, location = ?, current_job_title = ?, current_company = ?, 
                        total_experience_years = ?, total_experience_months = ?, industry = ?, functional_area = ?, 
                        resume_path = ?, profile_summary = ?, preferred_location = ?, expected_salary = ?, job_type = ?, 
                        desired_role = ?, preferred_industry = ?, shift_preference = ?, actively_looking = ?, 
                        profile_visibility = ?, profile_photo = ? 
                     WHERE user_id = ?`,
                    [...profileData.slice(1), user_id]
                );
            } else {
                const [result] = await connection.query(
                    `INSERT INTO job_seeker_profiles 
                        (user_id, full_name, email, phone, location, current_job_title, current_company, 
                        total_experience_years, total_experience_months, industry, functional_area, 
                        resume_path, profile_summary, preferred_location, expected_salary, job_type, 
                        desired_role, preferred_industry, shift_preference, actively_looking, 
                        profile_visibility, profile_photo) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    profileData
                );
                profileId = result.insertId;
            }

            // 2. Clear existing related records
            await connection.query('DELETE FROM seeker_education WHERE profile_id = ?', [profileId]);
            await connection.query('DELETE FROM seeker_experience WHERE profile_id = ?', [profileId]);
            await connection.query('DELETE FROM seeker_skills WHERE profile_id = ?', [profileId]);
            await connection.query('DELETE FROM seeker_projects WHERE profile_id = ?', [profileId]);
            await connection.query('DELETE FROM seeker_languages WHERE profile_id = ?', [profileId]);
            await connection.query('DELETE FROM seeker_certifications WHERE profile_id = ?', [profileId]);

            // 3. Batch insert new records
            if (education && education.length > 0) {
                for (const edu of education) {
                    await connection.query(
                        'INSERT INTO seeker_education (profile_id, degree, college, graduation_year, specialization) VALUES (?, ?, ?, ?, ?)',
                        [profileId, edu.degree, edu.college, edu.graduation_year, edu.specialization]
                    );
                }
            }

            if (experience && experience.length > 0) {
                for (const exp of experience) {
                    await connection.query(
                        'INSERT INTO seeker_experience (profile_id, company_name, role, start_date, end_date, is_current, responsibilities) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [profileId, exp.company_name, exp.role, exp.start_date, exp.end_date, exp.is_current, exp.responsibilities]
                    );
                }
            }

            if (skills && skills.length > 0) {
                for (const skill of skills) {
                    await connection.query(
                        'INSERT INTO seeker_skills (profile_id, skill_name, proficiency_level) VALUES (?, ?, ?)',
                        [profileId, skill.skill_name || skill, skill.proficiency_level || 'Intermediate']
                    );
                }
            }

            if (projects && projects.length > 0) {
                for (const proj of projects) {
                    await connection.query(
                        'INSERT INTO seeker_projects (profile_id, title, description, technologies_used) VALUES (?, ?, ?, ?)',
                        [profileId, proj.title, proj.description, proj.technologies_used]
                    );
                }
            }

            if (languages && languages.length > 0) {
                for (const lang of languages) {
                    await connection.query(
                        'INSERT INTO seeker_languages (profile_id, language, proficiency) VALUES (?, ?, ?)',
                        [profileId, lang.language, lang.proficiency]
                    );
                }
            }

            if (certifications && certifications.length > 0) {
                for (const cert of certifications) {
                    await connection.query(
                        'INSERT INTO seeker_certifications (profile_id, certification_name, issuing_organization, certificate_path) VALUES (?, ?, ?, ?)',
                        [profileId, cert.certification_name, cert.issuing_organization, cert.certificate_path || null]
                    );
                }
            }

            await connection.commit();
            return { profileId };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    /**
     * Get full seeker profile by user ID
     */
    async getFullProfile(userId) {
        const [profiles] = await db.query('SELECT * FROM job_seeker_profiles WHERE user_id = ?', [userId]);
        if (profiles.length === 0) return null;

        const profile = profiles[0];
        const profileId = profile.id;

        const [education] = await db.query('SELECT * FROM seeker_education WHERE profile_id = ?', [profileId]);
        const [experience] = await db.query('SELECT * FROM seeker_experience WHERE profile_id = ?', [profileId]);
        const [skills] = await db.query('SELECT * FROM seeker_skills WHERE profile_id = ?', [profileId]);
        const [projects] = await db.query('SELECT * FROM seeker_projects WHERE profile_id = ?', [profileId]);
        const [languages] = await db.query('SELECT * FROM seeker_languages WHERE profile_id = ?', [profileId]);
        const [certifications] = await db.query('SELECT * FROM seeker_certifications WHERE profile_id = ?', [profileId]);

        return {
            ...profile,
            education,
            experience,
            skills,
            projects,
            languages,
            certifications
        };
    },

    /**
     * Get seeker details by user ID (compat layer)
     */
    async getDetailsByUserId(userId) {
        // Alias for backward compatibility if needed by other components
        return await this.getFullProfile(userId);
    },

    /**
     * Get a single certification record by its ID
     */
    async getCertById(certId) {
        const [rows] = await db.query('SELECT * FROM seeker_certifications WHERE id = ?', [certId]);
        return rows.length > 0 ? rows[0] : null;
    }
};

module.exports = Seeker;

