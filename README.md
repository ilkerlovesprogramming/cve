CVE: Forced Extension + Remote Controlled Grabber & WebMiner

This repo is uploaded purely to draw attention to vulnerabilities. Use it for educational purposes, please do not harm anyone!

One day I woke up and said to myself, are we really safe and I wanted to learn how they can track us with cookies through Chrome and I decided to go on the path under the iceberg and did the following;

1) Think more cunningly than a fox.
2) Add a few spices to the food and make it more impressive than usual.
3) Rat poison in the trap!

At first I tried this with powershell but why would the user payload work, I tried it on itself with 3rd party programs like SmartInstaller and the extension really forced its way into my computer; The bad side is that it is both a sandbox environment and high-level programs cannot see it, because chrome itself is already a sandbox and has very few accesses. But when you gain these accesses, it is really easy to access and I did this with Chrome Developer Tools. Now you may be thinking, well, it is very easy to prevent this.

Absolutely not! Obfuscate the code and you are ready again! This is a general problem of Chromium-based browsers. And it can work on more than one browser. (Every Chromium Browser that Supports Manifest 3+.)