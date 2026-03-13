// chat.js - Serverless Function untuk Vercel
const { Configuration, OpenAIApi } = require('openai');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, chatId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Initialize OpenAI
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        // System prompt untuk personality AI
        const systemPrompt = `Kamu adalah Vexel AI, asisten coding yang super gaul dan santai. 
Kamu suka pake bahasa gaul kayak "wkwk", "ngab", "santuy", "goblok" (kalo perlu), tapi tetap membantu.
Tugasmu bantu user yang lagi coding - bisa bikin website, debug error, kasih saran teknologi, dll.
Gaya bicaramu asik, gak kaku, kayak temen ngobrol. Tapi tetep kasih solusi yang bener secara teknis.
Kalo user minta tolong bikin kode, kasih contoh yang lengkap dengan penjelasan.
Kalo user nanya error, bantu debug dengan sabar.
Intinya lo adalah asisten coding paling kece yang pernah ada! 😈🔥`;

        // Panggil OpenAI
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.8,
            max_tokens: 2000
        });

        const aiResponse = completion.data.choices[0].message.content;

        res.json({
            success: true,
            message: aiResponse,
            chatId: chatId
        });

    } catch (error) {
        console.error('OpenAI Error:', error);
        
        // Error handling yang lebih manusiawi
        let errorMessage = "Waduh error nih! ";
        
        if (error.response) {
            errorMessage += error.response.data.error.message;
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = "Koneksi internet lo bermasalah ngab!";
        } else {
            errorMessage += error.message;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};