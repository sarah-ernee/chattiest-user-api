import express, { json } from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs/promises";

const app = express();
const upload = multer({ dest: "uploads/" });

const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// API function that reads chat log files from client side
// Returns DESC-sorted array of objects containing username and their word count
app.post("/process-chat-logs", upload.array("chatlog"), async (req, res) => {
  if (req.files.length === 0) {
    return res.status(400).send("No file uploaded");
  }

  if (!req.files.every((file) => file.mimetype === "text/plain")) {
    return res
      .status(400)
      .send("Invalid file format received");
  }

  // Default to showing top 10 if client does not specify k
  const k = parseInt(req.body.k) || 10;

  try {
    let data = {};
    for (const file of req.files) {
      const fileWordCounts = await processChatLog(file.path);
      data = mergeWordCounts(data, fileWordCounts);

      await fs.unlink(file.path);
    }

    const topUsers = getTopUsers(data, k);
    res.json(topUsers);
  } catch (error) {
    console.error("Error processing chat logs:", error);
    res.status(500).send("Error processing file");
  }
});

// Helper function to process each chat log
async function processChatLog(filePath) {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const userWordCounts = {};
  let currUser = null;

  const lines = fileContent.split("\n");

  lines.forEach((line) => {
    const username = line.match(/^<(.+?)>/);

    if (username) {
      currUser = username[1];
      const words = line.slice(username[0].length).trim().split(/\s+/).length;
      userWordCounts[currUser] = (userWordCounts[currUser] || 0) + words;
    }

    // Attribute lines to last identified user
    else if (currUser) {
      const words = line.trim().split(/\s+/).length;
      userWordCounts[currUser] += words;
    }
  });

  return userWordCounts;
}

// Helper to compound results from multiple files
// Compounds usernames that were in one file but not in another as well with the if-else block
function mergeWordCounts(filesCount, perFileCount) {
  for (const user in perFileCount) {
    if (filesCount.hasOwnProperty(user)) {
      filesCount[user] += perFileCount[user];
    } else {
      filesCount[user] = perFileCount[user];
    }
  }

  return filesCount;
}

// Helper to get top chattiest users
function getTopUsers(userWordCounts, k) {
  const arr = Object.entries(userWordCounts);
  const sortedArr = arr.sort((a, b) => {
    return b[1] - a[1];
  });

  // Limit according to k
  const topEntries = sortedArr.slice(0, k);
  const topUsers = topEntries.map(([user, count]) => ({
    user,
    words: count,
  }));

  return topUsers;
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
