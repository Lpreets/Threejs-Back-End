import express from "express";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import stream from "stream";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.route("/").get((req, res) => {
  res.status(200).json({ message: "Hello from DALL.E ROUTES" });
});

router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    };

    const body = {
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url"
    };

    const aiResponse = await axios.post(
      "https://api.openai.com/v1/images/generations",
      body,
      config
    );

    const imageUrl = aiResponse.data.data[0].url;

    // Fetch the image data
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    // Set the correct content type
    res.set('Content-Type', 'image/png');

    // Convert the image data to a stream and send it
    const imageStream = new stream.PassThrough();
    imageStream.end(imageResponse.data);
    imageStream.pipe(res);

  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(
        error?.response?.data?.error?.message || "An unknown error occurred"
      );
  }
});

export default router;
