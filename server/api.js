const express = require('express');
const cors = require('cors');
const multer = require('multer');
const serverless = require('serverless-http');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('./database'); // Now returns supabase client
const XLSX = require('xlsx');
const JSON5 = require('json5');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const SESSIONS = new Map(); // Kept for legacy if needed, but we are moving to stateless

// Middleware
app.use(cors());
app.use(express.json());
const router = express.Router();

// Middleware to check database connection health
app.use((req, res, next) => {
    if (!supabase) {
        // Return JSON error so frontend doesn't get "Unexpected token <" (HTML)
        return res.status(500).json({
            error: 'Server Misconfiguration: SUPABASE_URL or SUPABASE_KEY is missing. Please configure Environment Variables in Netlify.'
        });
    }
    next();
});

// ... (imports remain the same)

// Memory storage for uploads (files will be sent to Supabase Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

// ... (uploadToSupabase function remains same) ...
async function uploadToSupabase(file, bucket = 'product-images') {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype
        });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
}

// --- API Routes on Router ---

// Test Route
router.get('/hello', (req, res) => {
    res.json({ message: "Hello from Netlify!", path: req.path });
});

// Products CRUD
router.get('/products', async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, description, treatment, tags } = req.body;
        let image_url = null;

        if (req.file) {
            image_url = await uploadToSupabase(req.file);
        }

        const { data, error } = await supabase
            .from('products')
            .insert([{ name, description, treatment, tags, image_url }])
            .select();

        if (error) throw error;

        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/products/template', (req, res) => {
    try {
        const wb = XLSX.utils.book_new();
        const headers = [
            { name: "Contoh Fungisida", description: "Deskripsi...", treatment: "Semprot...", tags: "jamur, daun" }
        ];
        const ws = XLSX.utils.json_to_sheet(headers);
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="template_produk.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/products/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const productsRaw = XLSX.utils.sheet_to_json(worksheet);

        if (!Array.isArray(productsRaw) || productsRaw.length === 0) {
            return res.status(400).json({ error: 'File Excel kosong atau format salah.' });
        }

        const productsToInsert = productsRaw.map(item => ({
            name: item.name || item.Name || 'Unnamed',
            description: item.description || item.Description || '',
            treatment: item.treatment || item.Treatment || '',
            tags: item.tags || item.Tags || '',
            image_url: null
        }));

        const { data, error } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();

        if (error) throw error;

        res.json({ success: true, count: data.length });
    } catch (error) {
        console.error("Import error:", error);
        res.status(500).json({ error: 'Gagal mengimpor: ' + error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Product
router.patch('/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description, treatment, tags } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (treatment) updates.treatment = treatment;
        if (tags) updates.tags = tags;

        if (req.file) {
            updates.image_url = await uploadToSupabase(req.file);
        }

        const { error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Settings CRUD
router.get('/settings', async (req, res) => {
    try {
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.json({});
            throw error;
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/settings', async (req, res) => {
    try {
        const { provider, api_key, base_url, model_name, custom_prompt, company_address, company_contact, company_hours } = req.body;

        if (!provider) {
            return res.status(400).json({ error: 'Provider is required' });
        }

        const updates = {
            provider,
            api_key,
            base_url,
            model_name,
            custom_prompt: custom_prompt || '',
            company_address: company_address || '',
            company_contact: company_contact || '',
            company_hours: company_hours || '',
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('settings')
            .upsert({ id: 1, ...updates });

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: error.message });
    }
});

// AI Analysis Endpoint
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
        if (!settings) return res.status(500).json({ error: 'Settings not configured' });

        if (!settings.api_key && settings.provider === 'gemini') {
            return res.status(500).json({ error: 'Gemini API Key not configured in settings' });
        }

        const fileToGenerativePart = (buffer, mimeType) => {
            return {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType
                },
            };
        };

        const DEFAULT_PROMPT = `
      Analisis gambar tanaman ini untuk mendeteksi penyakit. 
      Lakukan analisis yang SANGAT MENDALAM, KOMPREHENSIF, dan AKURAT.
      Jelaskan gejala yang terlihat, kemungkinan penyebab, dan biologi patogen jika ada.
      
      Berikan respon dalam format JSON SAGE dengan struktur berikut:
      {
        "identified": boolean, // true jika tanaman/penyakit terdeteksi
        "disease_name": string, // Nama penyakit dalam Bahasa Indonesia (atau 'Tanaman Sehat'),
        "description": string, // Penjelasan mendalam tentang penyakit, gejala, dan dampaknya (Bahasa Indonesia)
        "confidence": number, // 0-1
        "treatment_recommendation": string, // Panduan penanganan langkah demi langkah, termasuk pencegahan dan pengendalian kimia/biologis (Bahasa Indonesia)
        "tags": string[] // Kata kunci untuk pencocokan produk (contoh: jamur, insektisida, bercak daun, layu)
      }
      JANGAN GUNAKAN \`\`\`json atau \`\`\`. HANYA RAW JSON.
    `;

        let prompt = (settings.custom_prompt && settings.custom_prompt.trim().length > 0)
            ? settings.custom_prompt
            : DEFAULT_PROMPT;

        if (req.body.user_notes && req.body.user_notes.trim()) {
            prompt += `\nINFORMASI TAMBAHAN DARI PENGGUNA:\n"${req.body.user_notes}"\nGunakan informasi di atas untuk mempertajam analisis Anda, namun tetap verifikasi berdasarkan visual gambar.`;
        }

        if (settings.custom_prompt) {
            prompt += `\n--------------------------------------------------\nINSTRUKSI TAMBAHAN SISTEM (JANGAN DIABAIKAN):\nDi bagian paling akhir jawaban Anda, WAJIB sertakan ringkasan data ini agar sistem bisa membacanya:\n- Penyakit: [Nama Penyakit]\n- Keyakinan: [Angka 0-100]%\n- Rekomendasi: [Tulis ulang poin utamanya saja]\n--------------------------------------------------\n`;
        }

        let analysisResult = null;

        const createFallbackResult = (rawText) => {
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').replace(/\*\*/g, '').replace(/__/g, '').replace(/^\s*[-•]\s*/gm, '').trim();
            const confMatch = cleanText.match(/(?:Keyakinan|Confidence|Tingkat Keyakinan|Akurasi|Probabilitas)\s*[:=]\s*(\d+(?:\.\d+)?)\s*%?/i);
            const nameMatch = cleanText.match(/(?:Penyakit|Disease|Diagnosa|Identifikasi)\s*[:=]\s*([^\n]+)/i);
            const treatMatch = cleanText.match(/(?:Rekomendasi|Penanganan|Pengendalian|Solusi)\s*[:=]\s*([\s\S]*?)(?=$|(?:\n\s*(?:Keyakinan|Penyakit|Tingkat|Tags)))/i);

            let name = nameMatch ? nameMatch[1].trim() : "Hasil Analisis (Format Teks)";
            let confidence = 0.5;
            if (confMatch) {
                let val = parseFloat(confMatch[1]);
                confidence = val > 1 ? val / 100 : val;
            }
            let treatment = treatMatch ? treatMatch[1].trim() : "Lihat pembahasan lengkap di atas.";
            if (treatment.length < 10) treatment = "Lihat pembahasan lengkap di atas.";

            return {
                identified: true,
                disease_name: name,
                description: cleanText,
                treatment_recommendation: treatment,
                confidence: confidence,
                tags: []
            };
        };

        if (settings.provider === 'gemini') {
            const genAI = new GoogleGenerativeAI(settings.api_key);
            const model = genAI.getGenerativeModel({
                model: settings.model_name || 'gemini-1.5-flash',
                generationConfig: { responseMimeType: "application/json" }
            });

            const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            console.log("Raw Gemini Output:", text);

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text;

            try {
                analysisResult = JSON5.parse(jsonStr);
            } catch (e) {
                console.error("JSON5 Parse Error:", e);
                analysisResult = createFallbackResult(text);
            }
        } else {
            if (!settings.base_url) return res.status(400).json({ error: 'Base URL is required for Custom AI provider' });

            const imageBase64 = req.file.buffer.toString("base64");
            const mimeType = req.file.mimetype;
            const dataUrl = `data:${mimeType};base64,${imageBase64}`;
            const payload = {
                model: settings.model_name || 'gpt-4-vision-preview',
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: dataUrl } }
                        ]
                    }
                ],
                max_tokens: 1000
            };

            const customRes = await fetch(settings.base_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.api_key || ''}` },
                body: JSON.stringify(payload)
            });

            if (!customRes.ok) {
                const errText = await customRes.text();
                throw new Error(`Custom AI Error (${customRes.status}) at ${settings.base_url}: ${errText}`);
            }

            const customData = await customRes.json();
            let content = '';
            if (customData.choices && customData.choices.length > 0) content = customData.choices[0].message.content;
            else if (customData.response) content = customData.response;
            else content = JSON.stringify(customData);

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;

            try {
                analysisResult = JSON5.parse(jsonStr);
            } catch (e) {
                analysisResult = createFallbackResult(content);
            }
        }

        let recommendedProducts = [];
        if (analysisResult && analysisResult.tags) {
            const { data: products } = await supabase.from('products').select('*');
            if (products) {
                recommendedProducts = products.filter(p => {
                    if (!p.tags) return false;
                    const pTags = p.tags.toLowerCase().split(',').map(t => t.trim());
                    return analysisResult.tags.some(t => pTags.includes(t.toLowerCase()));
                });
            }
        }

        const publicUrl = await uploadToSupabase(req.file);

        res.json({
            analysis: analysisResult,
            recommendations: recommendedProducts,
            image_url: publicUrl
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Analysis failed: ${error.message}` });
    }
});

// --- Auth & User Management ---

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token expired or invalid' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    requireAuth(req, res, () => {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admin only' });
        next();
    });
};

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();
        if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
        if (user.expires_at && new Date(user.expires_at) < new Date()) return res.status(403).json({ error: 'Masa aktif akun Anda sudah habis. Hubungi Admin.' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, expires_at: user.expires_at } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/logout', (req, res) => {
    res.json({ success: true });
});

router.get('/users', requireAdmin, async (req, res) => {
    const { data: users, error } = await supabase.from('users').select('id, username, role, expires_at, created_at');
    if (error) return res.status(500).json({ error: error.message });
    res.json(users);
});

router.post('/users', requireAdmin, async (req, res) => {
    try {
        const { username, password, days_active } = req.body;
        const hash = bcrypt.hashSync(password, 10);
        let expires_at = null;
        if (days_active) {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(days_active));
            expires_at = date.toISOString();
        }
        const { error } = await supabase.from('users').insert([{ username, password: hash, role: 'user', expires_at }]);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { password, days_active } = req.body;
        const updates = {};
        if (password) updates.password = bcrypt.hashSync(password, 10);
        if (days_active !== undefined) {
            let expires_at = null;
            if (days_active) {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(days_active));
                expires_at = date.toISOString();
            }
            updates.expires_at = expires_at;
        }
        const { error } = await supabase.from('users').update(updates).eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chat Agent Endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
        const { data: products } = await supabase.from('products').select('*');
        const productCatalog = products ? products.map(p => `- ${p.name}: ${p.description} (Kategori: ${p.tags})`).join('\n') : '';

        const COMPANY_CONTEXT = `
        Anda adalah AI Assistant cerdas untuk PT. Gama Agro Sejati.
        INFORMASI PERUSAHAAN:
        - Nama: PT. Gama Agro Sejati
        - Fokus: Solusi pertanian terpadu.
        - Alamat: ${settings?.company_address || "Jl. Gama Agro No. 1, Indonesia"}
        - Kontak: ${settings?.company_contact || "contact@gamaagro.com"}
        - Jam Operasional: ${settings?.company_hours || "Senin - Jumat: 08.00 - 16.00"}
        KATALOG PRODUK KAMI:
        ${productCatalog}
        ATURAN JAWABAN:
        1. Jawablah dengan ramah, profesional, dan membantu.
        2. Gunakan data dari KATALOG PRODUK.
        3. Jika ditanya masalah penyakit, arahkan ke fitur "Analisis Foto".
        `;

        const fullSystemPrompt = COMPANY_CONTEXT + "\n\nPERTANYAAN USER SAAT INI:\n" + message;
        let replyText = "";

        if (settings?.provider === 'gemini') {
            const genAI = new GoogleGenerativeAI(settings.api_key);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = model.startChat({ history: history || [] });
            const result = await chat.sendMessage(fullSystemPrompt);
            const response = await result.response;
            replyText = response.text();
        } else if (settings?.base_url) {
            const payload = {
                model: settings.model_name || 'gpt-3.5-turbo',
                messages: [
                    { role: "system", content: COMPANY_CONTEXT },
                    ...(history || []).map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
                    { role: "user", content: message }
                ]
            };
            const customRes = await fetch(settings.base_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.api_key || ''}` },
                body: JSON.stringify(payload)
            });
            const data = await customRes.json();
            replyText = (data.choices && data.choices.length > 0) ? data.choices[0].message.content : (data.response || JSON.stringify(data));
        } else {
            replyText = "Maaf, konfigurasi AI belum lengkap.";
        }
        res.json({ reply: replyText });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Maaf, agen sedang istirahat. Coba lagi nanti." });
    }
});

// IMPORTANT: Mount the router correctly for both local and Netlify
// Netlify strips '/.netlify/functions/function_name' but passes the rest.
// For safety, we mount the router at BOTH / and /api to catch both cases.
app.use('/api', router); // For local dev where it matches /api/login
app.use('/', router);    // For Netlify where it might be rewriting to root of function

// Netlify Functions Export
module.exports.handler = serverless(app);

// Local Dev Start
if (!process.env.NETLIFY) {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
