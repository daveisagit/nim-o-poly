/*
Penny for your thoughts bower
*/

var thought_array = [];

export function get_thought() {
    if (thought_array.length == 0) {
        thought_array = Array.from(thoughts);
    }
    const i = Math.random() * thought_array.length;
    const thought = thought_array.splice(i, 1);
    return thought;
}

const thoughts = [
    "I need to browse",
    "It's the browser's trousers",
    "Mmm, gummy bears",
    "Shh, I'm browsing",
    "Browser not Bowser, ok!",
    "Great move!",
    "Why are we doing this?",
    "I wish I could give up",
    "Browser-licious!",
    "I've seen this position before",
    "I'm have an amazing experience",
    "You're playing well today",
    "Have you been drinking?",
    "Tap my face!",
    "Not again",
    "Time put my thinking pants on",
    "This will not end well",
    "Having a good day?",
    "Stop dribbling!",
    "Just chewing things over",
    "There's a lot going on here",
    "This is a dull game",
    "Are you cheating?",
    "What have you been eating?",
    "Stop toying with me!",
    "That was so obvious",
    "Are you getting help?",
    "What's that smell?",
    "Flim Flam Floom",
    "What is troubling you?",
    "Nice weather",
    "Will it ever end?",
    "Guess what?",
    "Wibble",
    "So little time",
    "Good grief!",
    "It's not rocket science",
    "Where's Poly gone?",
    "Well fly me to the moon!",
    "Anxious moments ...",
    "Did you sleep well?",
    "Excuse me!"
]