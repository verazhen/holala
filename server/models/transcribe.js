const { S3_SECRET, S3_KEY, S3_REGION } = process.env; // 30 days by seconds
const {
  TranscribeClient,
  StartTranscriptionJobCommand,
  ListTranscriptionJobsCommand,
} = require("@aws-sdk/client-transcribe"); // CommonJS import

const region = S3_REGION;
const credentials = {
  accessKeyId: S3_KEY,
  secretAccessKey: S3_SECRET,
};

const transcribeConfig = {
  region,
  credentials,
};
const transcribeClient = new TranscribeClient(transcribeConfig);

async function startTranscriptionRequest(name,lan,src) {
  const input = {
    TranscriptionJobName: name,
    LanguageCode: lan,
    Media: {
      MediaFileUri: src,
    },
    OutputBucketName: "verazon.online",
    Settings: {
      MaxSpeakerLabels: 10,
      ShowSpeakerLabels: true,
    },
    Subtitles: {
      Formats: ["vtt", "srt"],
    },
  };

  const transcribeCommand = new StartTranscriptionJobCommand(input);
  try {
    const transcribeResponse = await transcribeClient.send(transcribeCommand);
    console.log("Transcription job created, the details:");
    console.log(transcribeResponse.TranscriptionJob);
  } catch (err) {
    console.log(err);
  }
}

async function getTranscriptionRequest() {
  try {
    const data = await transcribeClient.send(
      new ListTranscriptionJobsCommand({
        JobNameContains: null, // Not required. Returns only transcription
        // job names containing this string
      })
    );
    console.log("Success", data.TranscriptionJobSummaries);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}

module.exports = { startTranscriptionRequest, getTranscriptionRequest };
