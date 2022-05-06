// const S3_KEY = 'AKIAWA3CCGQKAI7WXZXE'
// const S3_SECRET = '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'
// const S3_REGION = 'ap-southeast-1'

const AWS = require("aws-sdk");

const credentials = {
  accessKeyId: S3_KEY,
  secretAccessKey: S3_SECRET,
};

console.log(S3_SECRET, S3_KEY, S3_REGION);
console.log("S3_REGION");
const transcribeConfig = {
  region: S3_REGION,
  credentials,
};

const transcribe = new AWS.TranscribeService(transcribeConfig);

const {
  TranscribeClient,
  StartTranscriptionJobCommand,
  ListTranscriptionJobsCommand,
} = require("@aws-sdk/client-transcribe");

// const credentials = {
//   accessKeyId: S3_KEY,
//   secretAccessKey: S3_SECRET,
// };
//
// const transcribeConfig = {
//   region,
//   credentials,
// };
// const transcribeClient = new TranscribeClient(transcribeConfig);

async function startTranscriptionRequest(name, lan, src) {
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

  transcribe.startTranscriptionJob(input, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });
  //
  //   const transcribeCommand = new StartTranscriptionJobCommand(input);
  //   try {
  //     const transcribeResponse = await transcribeClient.send(transcribeCommand);
  //     console.log("Transcription job created, the details:");
  //     console.log(transcribeResponse.TranscriptionJob);
  //   } catch (err) {
  //     console.log(err);
  //   }
}

startTranscriptionRequest(
  "testes",
  "en-US",
  "https://s3.ap-southeast-1.amazonaws.com/verazon.online/holala/1/record/200adf8cdf0d6ed35e56f3038c6271af.mp4"
);
// async function getTranscriptionRequest() {
//   try {
//     const data = await transcribeClient.send(
//       new ListTranscriptionJobsCommand({
//         JobNameContains: null, // Not required. Returns only transcription
//         // job names containing this string
//       })
//     );
//     console.log("Success", data.TranscriptionJobSummaries);
//     return data; // For unit tests.
//   } catch (err) {
//     console.log("Error", err);
//   }
// }

// module.exports = { startTranscriptionRequest, getTranscriptionRequest };
