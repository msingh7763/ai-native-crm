const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const getAIModel = (responseSchema) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const config = responseSchema ? {
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  } : {};
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash', ...config });
};

exports.generateMongoQueryFromPrompt = async (prompt) => {
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.OBJECT,
        description: "A valid MongoDB query object for the Customer schema. Use standard stringified values for operators.",
      }
    },
    required: ["query"]
  };
  
  const model = getAIModel(schema);
  const systemInstruction = `You translate natural language marketing audience segment requests into valid MongoDB queries for Mongoose.
Schema Context:
Customer { name: String, email: String, phone: String, city: String, totalSpent: Number, lastOrderDate: Date (ISO String) }
Example input: "Customers who spent more than 5000 and haven't ordered in 60 days"
Example output: {"query": {"totalSpent": {"$gt": 5000}, "lastOrderDate": {"$lt": "2024-04-12T00:00:00.000Z"}}}
Current Date for reference: ${new Date().toISOString()}`;

  const result = await model.generateContent(`${systemInstruction}\n\nUser request: ${prompt}`);
  const text = result.response.text();
  try {
    const data = JSON.parse(text);
    return data.query;
  } catch (err) {
    throw new Error("Failed to parse AI-generated query");
  }
};

exports.generateCampaignContent = async (goal) => {
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING, description: "Campaign Name (short and catchy)" },
      subjectLine: { type: SchemaType.STRING, description: "Email/SMS subject line" },
      message: { type: SchemaType.STRING, description: "Personalized message body, use [Name] for placeholder" },
      recommendedChannel: { type: SchemaType.STRING, description: "One of: WhatsApp, Email, SMS, RCS" },
      targetSegmentDescription: { type: SchemaType.STRING, description: "A natural language description of who to target" }
    },
    required: ["name", "subjectLine", "message", "recommendedChannel", "targetSegmentDescription"]
  };

  const model = getAIModel(schema);
  const systemInstruction = `You are an expert marketing AI. Generate a campaign based on the provided goal.`;

  const result = await model.generateContent(`${systemInstruction}\n\nCampaign Goal: ${goal}`);
  const text = result.response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Failed to parse AI-generated campaign");
  }
};

exports.chatWithData = async (prompt, dataContext) => {
  const model = getAIModel();
  const instruction = `You are an AI assistant helping a user understand their CRM data. Answer the user's question concisely based on the following context data: ${JSON.stringify(dataContext)}.`;
  const result = await model.generateContent(`${instruction}\n\nUser Question: ${prompt}`);
  return result.response.text();
};
