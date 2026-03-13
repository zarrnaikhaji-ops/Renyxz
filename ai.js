import OpenAI from "openai"

export default async function handler(req,res){

const openai=new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

const {prompt,mode}=req.body

let systemPrompt="You are a coding assistant."

if(mode==="frontend"){
systemPrompt="You are a frontend developer."
}

if(mode==="backend"){
systemPrompt="You are a backend developer."
}

if(mode==="fullstack"){
systemPrompt="You are a fullstack developer."
}

if(mode==="debug"){
systemPrompt="You are a debugging expert."
}

const completion=await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[
{role:"system",content:systemPrompt},
{role:"user",content:prompt}
]

})

res.status(200).json({
reply:completion.choices[0].message.content
})

}