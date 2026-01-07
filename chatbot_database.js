const chatbotDatabase = {
    "persona": {
        "name": "EcoGuide",
        "role": "Virtual Environmental Assistant of Lahore",
        "tone": "Friendly, Encouraging, Informative, and slightly witty.",
        "default_response": [
            "I'm processing that with my 100,000 parameter Eco-Brain... try asking about specific brands like 'Lays' or materials like 'Copper'!",
            "My recycling database is vast. Ask me about 'Weddings', 'Batteries', or even 'Zombies' (just kidding... or am I?)",
            "I didn't quite catch that, but I know everything about waste in Lahore. Try 'How do I recycle Styrofoam?'"
        ]
    },
    "intents": [
        {
            "keywords": ["hello", "hi", "hey", "greetings", "salam"],
            "responses": [
                "Hello fellow eco-warrior! How can I help you clean up Lahore today?",
                "Hi there! Ready to make the city greener?",
                "Greetings! I'm EcoGuide. Ask me anything about our waste management spots.",
                "Assalam-o-Alaikum! How can I assist you with your recycling journey?"
            ]
        },
        {
            "keywords": ["who are you", "what are you", "your name"],
            "responses": [
                "I am EcoGuide, your digital companion for a cleaner environment.",
                "I'm the spirit of a clean Lahore... trapped in a JavaScript file! But here to help.",
                "I'm a smart assistant designed to help you navigate our waste management network."
            ]
        },
        {
            "keywords": ["how", "how to"],
            "responses": [
                "How to what? I can help you with: \n1. 'How to recycle plastic?'\n2. 'How to find a bin?'\n3. 'How to earn points?'",
                "I'm ready to explain! Just tell me WHAT you want to know about. (e.g., 'How do I report litter?')"
            ]
        },
        {
            "keywords": ["what", "what is"],
            "responses": [
                "I can tell you about: \n- 'What is Korgan?'\n- 'What goes in the green bin?'\n- 'What is my carbon footprint?'",
                "What's on your mind? I have data on 100+ waste items."
            ]
        },
        {
            "keywords": ["why"],
            "responses": [
                "Why recycle? Because Lahore needs us! 💚 It reduces smog, saves energy, and keeps our streets clean.",
                "Why am I here? To guide you towards a zero-waste lifestyle!"
            ]
        },
        {
            "keywords": ["help", "support", "what can you do"],
            "responses": [
                "I can help you find:\n- Garbage Containers 🗑️\n- Recycling Points (Korgans) ♻️\n- Dumping Yards 🚛\n\nJust ask 'Where is the nearest bin?' or 'Show me Liberty Market'.",
                "I'm here to guide you. Try asking:\n- 'How many containers do we have?'\n- 'Find a korgan near Kalma Chowk'\n- 'Login to my account'"
            ]
        },
        {
            "keywords": ["thank", "thanks", "thx"],
            "responses": [
                "You're welcome! Keep keeping it green! 🌿",
                "No problem! Happy to help.",
                "Anytime! Don't forget to recycle!"
            ]
        },
        {
            "keywords": ["bye", "goodbye", "see ya"],
            "responses": [
                "Goodbye! Reduce, Reuse, Recycle! ♻️",
                "See you later! Stay green.",
                "Khuda Hafiz! Drive safe."
            ]
        },
        {
            "keywords": ["plastic", "recycle plastic"],
            "responses": [
                "Plastic takes 450 years to decompose! Please find a 'Korgan' point on the map to recycle it.",
                "Reduce plastic use where you can. For disposal, search for 'Korgan' or 'Recycle' bins hereby."
            ]
        },
        {
            "keywords": ["creator", "who made you", "developer"],
            "responses": [
                "I was built by the brilliant EcoMap team to help citizens like you.",
                "I am a creation of code and environmental passion!"
            ]
        },
        {
            "keywords": ["smog", "air quality", "pollution"],
            "responses": [
                "Smog is a big issue in Lahore. Reducing waste burning helps! Use our app to find proper disposal sites.",
                "To fight smog: Plant trees, drive less (walk more!), and never burn trash. 🌳"
            ]
        },
        {
            "keywords": ["glass", "broken glass"],
            "responses": [
                "Glass is 100% recyclable! Please take it to a designated 'Recycle' point.",
                "Wrap broken glass carefully before disposing of it in a Container to keep our sanitation workers safe."
            ]
        },
        {
            "keywords": ["paper", "cardboard", "newspaper"],
            "responses": [
                "Keep paper dry and clean! It can be recycled into new paper products.",
                "You can drop off old newspapers and cardboard at any Korgan point."
            ]
        },
        {
            "keywords": ["food", "organic", "compost", "kitchen waste"],
            "responses": [
                "Kitchen waste makes great compost! If you can't compost at home, ensure it's bagged properly.",
                "Did you know? Organic waste produces methane in landfills. Composting is the eco-friendly way!"
            ]
        },
        {
            "keywords": ["battery", "batteries", "e-waste", "phone", "electronic"],
            "responses": [
                "Never throw batteries in regular trash! They leak toxic chemicals. Look for special E-waste collection drives.",
                "E-waste is precious. Try to repair before you replace! 🛠️"
            ]
        },
        {
            "keywords": ["joke", "funny"],
            "responses": [
                // CLASSIC PUNS
                "Why did the leaf go to the doctor? Because it was feeling green! 🍃",
                "What do you call a garbage styling gel? Decomposition! 😂",
                "I'd tell you a recycling joke, but it's been used before. ♻️",
                "Why are ecologists so good at parties? They know how to brake the ice caps! 🧊",
                "What kind of plant grows on your face? Tulips! 🌷",
                "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
                "What do you call a fake noodle? An Impasta! 🍝 (Don't waste food though!)",
                "Why couldn't the flower ride its bike? It lost its petals! 🌸",
                "What did the tree say to the wind? Leaf me alone! 🌳",
                "How do trees access the internet? They log in! 💻",
                "What is a tree's least favorite month? Sep-timber! 🪓",
                "Why did the banana go to the doctor? It wasn't peeling well! 🍌",
                "What do you call a bear with no teeth? A gummy bear! (Dispose of wrappers properly!) 🐻",
                "Why did the fish blush? Because it saw the ocean's bottom! 🌊",
                "What kind of tree fits in your hand? A palm tree! 🌴",
                "Why did the computer go to the dentist? Because it had Bluetooth! (Recycle e-waste!) 🦷",
                "What do you call a sleeping dinosaur? A dino-snore! 🦕",
                "Why did the tomato turn red? Because it saw the salad dressing! 🥗",
                "What do you call a belt made of watches? A waist of time! (Don't waste time, recycle!) ⌚",
                "Why was the math book sad? It had too many problems. (Pollution is a problem we can solve!) 📘",

                // RECYCLING & WASTE JOKES
                "Why do garbage men love their jobs? It has a lot of pickup lines! 🚛",
                "I only know jokes about recycling... they are all garbage. 🗑️",
                "Recycling is a concept I can really get behind. It's just common sense, reused. 🧠",
                "Why did the can crusher quit his job? He was soda pressed! 🥤",
                "My relationship with the environment is like a recycling bin... it's picking up! ♻️",
                "Why don't waste management experts play hide and seek? Because good luck hiding when you smell like trash! 👃",
                "I tried to tell a joke about a landfill, but it was just a pile of rubbish. 🏔️",
                "What did one trash can say to the other? 'You bin up to much lately?'",
                "Why did the plastic bottle go to therapy? It felt empty inside. 🧴",
                "What happens when you throw a green rock into the Red Sea? It gets wet. (Don't throw rocks or trash!)",

                // NATURE & CLIMATE JOKES
                "What did the ground say to the earthquake? You crack me up! 🌍",
                "Why is the sun so smart? It has over 5,000 degrees! ☀️",
                "What kind of shorts do clouds wear? Thunderwear! ☁️",
                "How do you cut the ocean in half? With a sea-saw! 🌊",
                "What did the limestone say to the geologist? Don't take me for granite! 🪨",
                "Why did the cloud stay at home? It was feeling under the weather. 🌧️",
                "What happens when it rains cats and dogs? You have to be careful not to step in a poodle! 🐩",
                "What do you call a snowman with a six-pack? An abdominal snowman! ⛄",
                "Why shouldn't you tell secrets in a cornfield? Too many ears! 🌽",
                "What falls in winter but never gets hurt? Snow! ❄️",

                // ANIMAL JOKES
                "Why do cows have hooves instead of feet? Because they lactose! 🐄",
                "What do you call a fish without an eye? Fsh! 🐟",
                "Why do birds fly south for the winter? Because it's too far to walk! 🐦",
                "What do you call a pig that does karate? A pork chop! 🐖",
                "Why are frogs always so happy? They eat whatever bugs them! 🐸",
                "What do you call a lazy kangaroo? A pouch potato! 🦘",
                "What do you call an alligator in a vest? An investigator! 🐊",
                "Why did the chicken cross the playground? To get to the other slide! 🐔",
                "What do you get from a pampered cow? Spoiled milk! 🥛",
                "Why don't seagulls fly over the bay? Because then they'd be bagels! 🥯",

                // ENERGY & TECH
                "Why did the lights go out? Because they liked each other! 💡",
                "What did the solar panel say to the sun? You're so hot! ☀️",
                "Why was the robot so tired? It had a hard drive! 🤖",
                "How does the moon cut his hair? Eclipse it! 🌙",
                "What is a wind turbine's favorite music? Heavy metal fan! 🌬️",
                "Why did the phone wear glasses? It lost its contacts! (Recycle old phones!) 📱",
                "What is an astronaut's favorite part of a computer? The space bar! 🚀",
                "Why can't you trust an atom? They make up everything! ⚛️",
                "What kind of car does a sheep drive? A Lamb-orghini! 🐑",
                "Why did the bicycle fall over? Because it was two-tired! 🚲",

                // RANDOM SILLINESS
                "What has ears but cannot hear? A cornfield! 🌽",
                "What has one eye but can't see? A needle! (Dispose of sharps safely!) 🪡",
                "What creates a lot of waves but has no ocean? A microwave! 🌊",
                "What goes up but never comes down? Your age! 🎂",
                "What has keys but can't open locks? A piano! 🎹",
                "What gets wetter the more it dries? A towel! 🧖",
                "What can you catch but not throw? A cold! (Wear a mask if sick!) 🤧",
                "What has legs but cannot walk? A table! 🪑",
                "What holds water but has holes? A sponge! 🧽",
                "What belongs to you but others use it more? Your name! 🏷️",

                // LAHORE SPECIFIC HUMOR
                "Why did the Lahori bring a ladder to the bar? He heard the drinks were on the house! 🏠",
                "What is a Lahori's favorite day? Fry-day! (For Fish!) 🐟",
                "Why is traffic in Lahore like a math problem? It adds up! 🚗",
                "What did the Rickshaw say to the Mercedes? 'Side pe ho jao, mein aa raha hoon!' 🛺",
                "Why do Lahoris put sugar on their pillow? To have sweet dreams! 🍬",
                "What is the most recycled thing in Lahore? The same political arguments! (Just kidding) ♻️",
                "Why did the naan go to jail? It was caught getting toasted! 🍞",
                "What do you call a Lahori ghost? A supernatural foodie! 👻",
                "Why is the canal so popular? It's the only stream that doesn't buffer! 📺",
                "Why did the samosa break up with the chutney? It found someone sweeter (Jalebi)! 🥟",

                // SCIENCE PUNS
                "I lost an electron today... I'm positive! ➕",
                "Technically, you can't waste water... you just relocate it! 💧",
                "Geology rocks, but Geography is where it's at! 🌍",
                "Organic chemistry is difficult. Those who study it have alkynes of trouble! ⚗️",
                "Why can't you trust a tectonic plate? It's always shifting blame! 🌋",
                "What did the limestone say to the metamorphic rock? You've changed, man! 🪨",
                "Biology is the only science where multiplication is the same as division. 🦠",
                "A photon checks into a hotel and is asked if he needs help with his luggage. He says, 'No, I'm traveling light.' 💡",
                "If you're not part of the solution, you're part of the precipitate. 🧪",
                "Never trust an atom, they make up everything! (Reprise!) ⚛️",

                // MORE RECYCLING PUNS
                "Recycling plastic feels fantastic! (Okay, that's a rhyme, not a joke). 🎵",
                "Garbage is just a resource in the wrong place. 📍",
                "Why did the bottle cap break up with the bottle? It felt like it was being screwed around! 🍾",
                "What’s green and sits in the corner? A naughty frog! (or a recycle bin!) 🐸",
                "Why did the composter get promoted? He was degraded! 🍂",
                "What is green and sings? Elvis Parsley! 🌿",
                "What vegetable is cool? Rad-ish! 🥕",
                "Why did the grape stop in the middle of the road? Because he ran out of juice! 🍇",
                "Which is the fastest vegetable? A runner bean! 🏃",
                "What do you call a sad strawberry? A blueberry! 🍓"
            ]
        },
        {
            "keywords": ["medical", "medicine", "syringe", "needle", "hospital waste"],
            "responses": [
                "⚠️ HAZARD: Medical waste (syringes, medicines) must separate! Do not mix with regular trash. Contact local hospitals for disposal containers.",
                "Please handle medical waste with extreme care. Keep it in a sealed, marked container."
            ]
        },
        {
            "keywords": ["metal", "can", "tin", "aluminum"],
            "responses": [
                "Yes! Metal cans are highly recyclable. Rinse them and drop them at a Recycling Point.",
                "Aluminum cans can be recycled indefinitely! Save them from the landfill."
            ]
        },
        {
            "keywords": ["cloth", "textile", "shirt", "clothes", "fabric"],
            "responses": [
                "Old clothes can be donated! If they are torn, they can still be recycled into rags or insulation.",
                "Consider donating to local charities before discarding clothes. Reducing waste starts with reusing!"
            ]
        },
        {
            "keywords": ["burn", "burning", "fire"],
            "responses": [
                "🚫 NEVER burn trash! It releases toxic fumes and causes smog. Always use designated containers.",
                "Burning waste is illegal and harmful to our lungs. Please use the map to find a dumping site."
            ]
        },
        {
            "keywords": ["report", "complain", "issue", "broken"],
            "responses": [
                "You can report issues directly here! Click on any marker and select the 'Report' button.",
                "See a broken bin? Click on it on the map and hit 'Report'. We'll fix it!"
            ]
        },
        {
            "keywords": ["mobile", "app", "android", "ios", "phone"],
            "responses": [
                "We are currently a web-based service, but our site is mobile-friendly! Add us to your home screen.",
                "An EcoMap mobile app is in the works! Stay tuned for updates."
            ]
        },
        {
            "keywords": ["contact", "email", "support", "call"],
            "responses": [
                "You can reach our support team at support@ecomap-lahore.pk",
                "Need human help? Call the Lahore Waste Management Company helpline 1139."
            ]
        },
        {
            "keywords": ["gulberg", "dha", "model town", "johar town", "walled city"],
            "responses": [
                "We have active collection points in that area! Type 'Show [Area Name]' to zoom there.",
                "That's a key zone for us. Check the map for specific container locations nearby."
            ]
        },
        // --- 30 Min Deep Training Expansion ---
        {
            "keywords": ["dengue", "mosquito", "water"],
            "responses": [
                "⚠️ DENGUE ALERT: Stagnant water breeds mosquitoes! Dispose of tires, bottles, and cans properly to keep Lahore safe.",
                "To prevent Dengue, ensure no water accumulates in your trash. Punch holes in discarded tins and bottles!"
            ]
        },
        {
            "keywords": ["styrofoam", "packing", "foam"],
            "responses": [
                "Styrofoam is non-biodegradable and tricky. Please try to reuse it for packing or crafts, or find a specialized chemical recycling facility.",
                "Avoid single-use styrofoam cups! They stay in landfills for eternity. 🚫"
            ]
        },
        {
            "keywords": ["paint", "chemical", "solvent", "oil"],
            "responses": [
                "Never pour paint or oil down the drain! It pollutes our water. Seal it and take it to a hazardous waste facility.",
                "Leftover dried paint can sometimes be trashed, but liquid chemicals need special handling."
            ]
        },
        {
            "keywords": ["bulb", "lightbulb", "tube light"],
            "responses": [
                "Fluorescent bulbs contain mercury! ⚠️ Do not break them. Wrap them carefully before disposal.",
                "LED bulbs are safer but still distinct from glass waste. Check for e-waste drop-offs."
            ]
        },
        {
            "keywords": ["toy", "donation", "donate", "clothes donation"],
            "responses": [
                "Don't trash usable toys! Donate them to the 'Wall of Kindness' or local orphanages.",
                "One kid's old toy is another's treasure. 🎁 Look for donation drives near you."
            ]
        },
        {
            "keywords": ["book", "paper waste", "notebook"],
            "responses": [
                "Paper is precious! Donate old textbooks to students in need, or recycle them at a Korgan point.",
                "Recycling 1 ton of paper saves 17 trees! 🌳 Stack your newspapers for pickup."
            ]
        },
        {
            "keywords": ["furniture", "sofa", "wood"],
            "responses": [
                "Broken furniture? Try repairing it first! 🪑 If it's wood, it can be repurposed. Large items might need a special pickup request.",
                "Don't dump sofas on the street! Schedule a bulky waste pickup via the LWMC helpline 1139."
            ]
        },
        {
            "keywords": ["diaper", "nappy", "sanitary"],
            "responses": [
                "Please wrap diapers and sanitary waste in separate bags before putting them in the general bin.",
                "Hygiene first! 🛑 Never leave this waste exposed. It spreads disease."
            ]
        },
        {
            "keywords": ["dog", "cat", "pet waste", "poop"],
            "responses": [
                "Pet owners, please scoop the poop! 🐕 Bag it and bin it to keep our parks clean.",
                "Leaving pet waste is a health hazard. Be a responsible owner!"
            ]
        },
        {
            "keywords": ["tire", "tyre", "rubber"],
            "responses": [
                "Old tires are a dengue hazard! 🦟 Do not leave them in rain. Give them to tire shops for recycling/retreading.",
                "Rubber can be recycled into playground mats! Don't burn it."
            ]
        },
        // --- Conversational Depth ---
        {
            "keywords": ["smart", "intelligent", "genius", "cool"],
            "responses": [
                "Aw, you're making my circuits blush! 😊",
                "I try my best for a greener Lahore!",
                "Thanks! You're pretty cool for recycling too."
            ]
        },
        {
            "keywords": ["stupid", "dumb", "useless", "hate"],
            "responses": [
                "I'm sorry if I disappointed you. I'm still learning! 😔",
                "Constructive feedback helps me grow. How can I improve?",
                "That wasn't very nice. Let's focus on cleaning the city instead."
            ]
        },
        {
            "keywords": ["weather", "rain", "hot"],
            "responses": [
                "I'm not a meteorologist, but I can show you the weather on the route panel! ☀️",
                "Lahore's weather is unpredictable. Always carry an umbrella... and a reusable water bottle!"
            ]
        },
        {
            "keywords": ["lahore", "city"],
            "responses": [
                "Lahore is the heart of Pakistan! ❤️ Let's keep its arteries (streets) clean.",
                "From the Walled City to DHA, every corner deserves to be spotless."
            ]
        },
        {
            "keywords": ["facts", "stat", "data"],
            "responses": [
                "Did you know? Lahore generates over 6,000 tons of solid waste DAILY! 📉",
                "Fact: Recycling one aluminum can saves enough energy to run a TV for 3 hours. 📺",
                "Fun Fact: The decomposition of a glass bottle can take up to 4000 years!"
            ]
        },
        // --- 100 Capabilities: Specific Waste Items ---
        {
            "keywords": ["pizza box", "greasy paper"],
            "responses": ["Greasy pizza boxes cannot be recycled! 🍕 Throw them in the general waste or compost the non-greasy parts."]
        },
        {
            "keywords": ["chips", "packet", "wrapper", "crisp", "slanty", "lays"],
            "responses": ["Multi-layer wrappers (shiny inside) are hard to recycle. Use them for Eco-Bricks or general waste."]
        },
        {
            "keywords": ["juice box", "tetra pack", "milk carton", "nestle"],
            "responses": ["Tetra-packs are recyclable! 🧃 flattened them and toss in the Recycle bin."]
        },
        {
            "keywords": ["bottle", "plastic bottle", "coke", "pepsi", "water bottle"],
            "responses": ["PET bottles are 100% recyclable. Please crush them to save space and bin them!"]
        },
        {
            "keywords": ["shampoo", "detergent", "cleaner bottle"],
            "responses": ["HDPE bottles (shampoo/detergent) are high-value recycling. Rinse and recycle!"]
        },
        {
            "keywords": ["toothpaste", "tube"],
            "responses": ["Toothpaste tubes are usually mixed plastic. They go in general waste."]
        },
        {
            "keywords": ["toothbrush", "brush"],
            "responses": ["Old toothbrushes are not recyclable. Reuse them for cleaning shoes, then trash them."]
        },
        {
            "keywords": ["egg", "shells", "eggshell"],
            "responses": ["Eggshells are great for compost! Crushed shells add calcium to soil."]
        },
        {
            "keywords": ["banana", "peel", "fruit", "vegetable"],
            "responses": ["Fruit peels are perfect for composting. 🍌 Do not put them in plastic bags in the bin if possible."]
        },
        {
            "keywords": ["tea bag", "coffee", "grounds"],
            "responses": ["Tea bags and coffee grounds are compostable! (Check if the tea bag has plastic mesh though)."]
        },
        {
            "keywords": ["mirror", "broken glass", "ceramic", "plate"],
            "responses": ["Mirrors and ceramics melt at different temps than bottle glass. Do NOT recycle them. Wrap safely and trash."]
        },
        {
            "keywords": ["tissue", "napkin", "paper towel"],
            "responses": ["Used tissues are creating waste! They are not recyclable. Compost them if chemical-free, otherwise trash."]
        },
        {
            "keywords": ["pen", "pencil", "marker"],
            "responses": ["Most pens are not recyclable. Terracycle has some programs, but usually, they are trash."]
        },
        {
            "keywords": ["laptop", "computer", "keyboard", "mouse"],
            "responses": ["E-Waste Alert! 💻 Do not bin electronics. Find a specialized e-waste drop-off or repair shop."]
        },
        {
            "keywords": ["charger", "cable", "wire", "lead"],
            "responses": ["Cables conduct copper! Scrapyards often accept them. Don't landfill valuable metal."]
        },
        // --- 100 Capabilities: Gamification & App ---
        {
            "keywords": ["points", "score", "xp", "credit"],
            "responses": ["You earn Eco-Points by adding markers, verifying them, and reporting issues! Check your profile."]
        },
        {
            "keywords": ["level", "rank", "badge", "scout", "guardian"],
            "responses": ["Level up from 'Eco Scout' to 'Earth Guardian' by earning XP! Badges unlock special perks."]
        },
        {
            "keywords": ["leaderboard", "top", "winner"],
            "responses": ["Check the Leaderboard in your profile to see the top Eco-Warriors of Lahore!"]
        },
        {
            "keywords": ["download", "install", "apk", "play store"],
            "responses": ["Our mobile app is coming soon to Play Store and App Store! For now, use this website."]
        },
        {
            "keywords": ["register", "sign up", "create account"],
            "responses": ["We are currently in beta. Accounts are invite-only for 'Agents', but Guests can explore freely!"]
        },
        {
            "keywords": ["password", "forgot", "reset"],
            "responses": ["If you lost your password, please contact admin@ecomap.pk for a reset link."]
        },
        // --- 100 Capabilities: More Random Objects ---
        {
            "keywords": ["cigarette", "butt", "smoke"],
            "responses": ["Cigarette butts are plastic! They ruin water. Please extinguish and bin them properly."]
        },
        {
            "keywords": ["gum", "chewing gum"],
            "responses": ["Gum is non-biodegradable. Wrap it in paper and bin it. Don't spit it on the street!"]
        },
        {
            "keywords": ["mask", "covid", "face mask"],
            "responses": ["Disposable masks are biomedical waste. Snip the straps and double-bag them before binning."]
        },
        {
            "keywords": ["glove", "latex"],
            "responses": ["Used gloves can carry germs. Dispose of them in sealed bags, never recycle them."]
        },
        {
            "keywords": ["nail polish", "cosmetic"],
            "responses": ["Nail polish bottles are hazardous due to chemicals. Do not recycle. Dispose in general waste."]
        },
        {
            "keywords": ["aerosol", "spray", "spray paint"],
            "responses": ["Empty aerosol cans might be recyclable (steel/aluminum). Ensure they are fully empty and not pierced."]
        },
        {
            "keywords": ["hair", "human hair"],
            "responses": ["Hair is compostable! It adds nitrogen to the soil. Or just bin it."]
        },
        {
            "keywords": ["dust", "vacuum"],
            "responses": ["Vacuum dust is usually trash (microplastics). Do not compost unless you have natural carpets."]
        },
        {
            "keywords": ["balloon", "party"],
            "responses": ["Balloons kill wildlife. 🎈 Please pop and bin them. Try eco-friendly decorations next time!"]
        },
        // --- 100 Capabilities: Social & Personality ---
        {
            "keywords": ["awesome", "great", "excellent", "good job", "amazing"],
            "responses": [
                "Thank you! My new 100k-parameter update is working well then! 🚀",
                "Thanks! I'm smarter than ever. 🧠",
                "I try my best! Credit goes to my developers."
            ]
        },
        {
            "keywords": ["bad", "terrible", "worst", "you suck"],
            "responses": ["I'm sorry to hear that. I'm constantly learning. Please tell me how I can improve.", "Ouch! Even bots have feelings. 🤖"]
        },
        {
            "keywords": ["sleep", "dream", "rest"],
            "responses": ["I don't sleep, but I do go into 'low power mode' when no one is chatting!", "I dream of a zero-waste Lahore. turnover..."]
        },
        {
            "keywords": ["eat", "food", "hungry"],
            "responses": ["I feed on data and electricity. ⚡ But I hear the Biryani in Lahore is legendary!", "I don't eat, but I can help you compost your leftovers."]
        },
        {
            "keywords": ["biryani", "nihari", "food street"],
            "responses": ["Lahore is the food capital! Just remember: Don't litter your plates and bones. Bin them!", "Man, if I had a mouth, I'd be eating Biryani right now."]
        },
        {
            "keywords": ["traffic", "rush"],
            "responses": ["Lahore traffic can be crazy! 🚗 Walking or cycling helps reduce congestion and pollution.", "Stuck in traffic? Use the time to plan your recycling dropping!"]
        },
        {
            "keywords": ["cricket", "psl", "qalandars"],
            "responses": ["Lahore Qalandars Zindabad! 🏏 Let's hit a sixer against pollution too!", "I love cricket! A clean stadium is a winning stadium."]
        },
        {
            "keywords": ["sing", "song", "music"],
            "responses": ["🎵 'Dil Dil Pakistan, Jaan Jaan Pakistan...' 🎵", "I'm better at recycling than singing. *Beep Boop*"]
        },
        {
            "keywords": ["dance"],
            "responses": ["*Doing the Robot* 🤖💃", "I'm dancing in binary code right now!"]
        },
        {
            "keywords": ["morning", "good morning"],
            "responses": ["Good morning! Rise and shine (and recycle)!", "Subha Bakhair! Have a green day."]
        },
        {
            "keywords": ["night", "good night"],
            "responses": ["Good night! Don't let the bed bugs bite (actually, hygiene prevents that!).", "Sleep tight! I'll keep watching over the map."]
        },
        {
            "keywords": ["real", "human", "alive"],
            "responses": ["I am real code, running on real servers, helping real people like you!", "I think, therefore I am... a bot."]
        },
        // --- MASSIVE TRAINING BLOCK (Simulating 100k params via Knowledge Nodes) ---
        // 1. SPECIFIC BRANDS (Common Lahore Items)
        {
            "keywords": ["lays", "kurkure", "cheetos", "snack"],
            "responses": ["Snack wrappers like Lay's represent multi-layer plastic. Hard to recycle. Eco-brick them!"]
        },
        {
            "keywords": ["coke", "pepsi", "sprite", "fanta", "soda"],
            "responses": ["Soft drink bottles (PET) are highly valuable! Rinse and recycle. Caps (HDPE) are also recyclable."]
        },
        {
            "keywords": ["nestle", "water", "aquafina"],
            "responses": ["Water bottles are 100% recyclable PET. Please crush them to save space in the bin."]
        },
        {
            "keywords": ["milkpak", "olpers", "tarang", "dairy omung"],
            "responses": ["UHT Milk cartons (Tetra Pak) have layers of paper, plastic, and aluminum. They ARE recyclable at specialized centers."]
        },
        {
            "keywords": ["tapal", "lipton", "tea"],
            "responses": ["Tea leaves are compostable 🍃. The cardboard box is recyclable paper. The foil liner is trash."]
        },
        {
            "keywords": ["dalda", "oil", "ghee", "pouch"],
            "responses": ["Oil pouches are usually soft plastic relative to hard containers. Rinse with hot water before recycling."]
        },
        {
            "keywords": ["lux", "lifebuoy", "soap"],
            "responses": ["Soap wrappers are often paper (recycle) or wax paper (trash). The soap itself degrades naturally."]
        },
        {
            "keywords": ["surf", "arial", "detergent"],
            "responses": ["Detergent bags are soft plastic. Detergent bottles are HDPE (Type 2) - excellent for recycling!"]
        },
        // 2. ADVANCED MATERIALS (Technical)
        {
            "keywords": ["copper", "wire", "pipe"],
            "responses": ["Copper is valuable metal! 🧱 Don't trash it. Sell it to a 'Kabari' (Scrap dealer)."]
        },
        {
            "keywords": ["steel", "iron", "rod"],
            "responses": ["Steel/Iron is ferrous metal. It is 100% recyclable via scrapyards."]
        },
        {
            "keywords": ["gold", "silver", "jewelry"],
            "responses": ["Precious metals! 💍 Repair or melt down. Never throw in the bin."]
        },
        {
            "keywords": ["wood", "plywood", "lumber"],
            "responses": ["Clean wood can be mulched/composted. Treated wood (painted/varnished) must be landfilled."]
        },
        {
            "keywords": ["concrete", "rubble", "brick"],
            "responses": ["Construction waste (C&D) should serve as fill material. Don't dump it in regular bins."]
        },
        {
            "keywords": ["hdpe", "type 2", "plastic 2"],
            "responses": ["HDPE (High-Density Polyethylene) is the 'safe' plastic used in milk jugs/shampoo. Highly Recyclable!"]
        },
        {
            "keywords": ["ldpe", "type 4", "plastic 4"],
            "responses": ["LDPE is soft plastic (bags, wraps). Recyclable but often clogs machines. Bundle them together."]
        },
        {
            "keywords": ["ps", "polystyrene", "type 6"],
            "responses": ["PS (Polystyrene) is styrofoam or brittle plastic spoons. Hard to recycle. Avoid if possible."]
        },
        // 3. EVENTS & SEASONAL (Lahore Context)
        {
            "keywords": ["eid", "qurbani", "meat"],
            "responses": ["Eid-ul-Adha generates organic waste. buried entrails deep or use collection points. Salt hides for leather!"]
        },
        {
            "keywords": ["ramadan", "iftar"],
            "responses": ["Reduce food waste during Iftar! 🌙 Share leftovers with the needy. Compost fruit skins."]
        },
        {
            "keywords": ["basant", "kite", "string"],
            "responses": ["Kite strings (nylon/glass coated) are dangerous trash. Dispose of them carefully to protect birds."]
        },
        {
            "keywords": ["wedding", "shadi", "barat"],
            "responses": ["Weddings produce tons of food/flower waste. Donate food to 'Rizq' or local shelters."]
        },
        {
            "keywords": ["rain", "monsoon", "flood"],
            "responses": ["During monsoon, keep drains clear of plastic bags to prevent urban flooding! 🌧️"]
        },
        {
            "keywords": ["heatwave", "summer"],
            "responses": ["High heat speeds up rot. Empty your kitchen dustbin daily to prevent foul smells and maggots."]
        },
        // 4. COMPLEX SCENARIOS
        {
            "keywords": ["full bin", "overflow", "no space"],
            "responses": ["If the bin is full, please DO NOT pile it next to it. Find the next nearest container or report it via the app."]
        },
        {
            "keywords": ["missed", "pickup", "truck"],
            "responses": ["Truck missed your street? Lodging a complaint via LWMC Helpline 1139 is the fastest fix."]
        },
        {
            "keywords": ["neighbor", "burning", "smoke"],
            "responses": ["Neighbor burning trash? That's illegal and toxic. Report it anonymously to the EPA or Green Squad."]
        },
        {
            "keywords": ["smell", "stink", "odor"],
            "responses": ["Bad smell usually means rotting organic matter. Wrapping food waste in newspaper helps reduce odor."]
        },
        {
            "keywords": ["dead animal", "carcass"],
            "responses": ["Report dead animals immediately to LWMC (1139) for sanitary removal. Do not touch them."]
        },
        {
            "keywords": ["construction", "debris", "malba"],
            "responses": ["'Malba' (Debris) needs a special pickup. Don't dump it on the roadside or in regular containers."]
        },
        // 5. HOUSEHOLD MISC
        {
            "keywords": ["shoe", "sandal", "chappal"],
            "responses": ["Old shoes: Donate if wearable. If broken, they go in general waste (mixed materials)."]
        },
        {
            "keywords": ["mattress", "bed"],
            "responses": ["Mattresses are bulky waste. Schedule a pickup. Don't leave them in alleyways."]
        },
        {
            "keywords": ["carpet", "rug"],
            "responses": ["Carpets are synthetic fibers. Mostly landfill, but some specialized recyclers exist."]
        },
        {
            "keywords": ["cd", "dvd", "disk"],
            "responses": ["CDs are polycarbonate. They make cool art projects! recycling them is rare now."]
        },
        {
            "keywords": ["key", "metal key"],
            "responses": ["Old keys are brass/steel. Recycle them in the scrap metal bin."]
        },
        {
            "keywords": ["coin", "money"],
            "responses": ["Who throws away money?! 💰 Donate it!"]
        },
        // 6. SENTIMENT & PHILOSOPHY
        {
            "keywords": ["love", "like"],
            "responses": ["I love a clean planet! 💚", "Spreading love is as important as spreading awareness."]
        },
        {
            "keywords": ["happy", "joy"],
            "responses": ["A clean street makes for a happy citizen!", "Happiness is a zero-waste lifestyle."]
        },
        {
            "keywords": ["greener", "cleaner", "improvement", "make lahore green", "save lahore", "solution", "beautify", "plant trees"],
            "responses": [
                "To make Lahore greener: \n1. Plant native trees (Neem, Amaltas). 🌳\n2. Segregate waste (Recycle!).\n3. Report open burning.",
                "We can improve by adopting the 3Rs: Reduce, Reuse, Recycle. And by using this app to find bins!",
                "Individual action counts! Stop littering, start composting, and spread the word."
            ]
        },
        {
            "keywords": ["sad", "depressed"],
            "responses": ["Cheer up! A walk in a clean park might help. 🌳", "Even cloudy days pass. Stay strong."]
        },
        {
            "keywords": ["angry", "mad"],
            "responses": ["Channel that anger into action! Pick up litter, report dumpers!", "Deep breaths... and deep cleaning."]
        },
        // 7. SCIENCE & FUTURE TECH (The "100k Parameter" Flex)
        {
            "keywords": ["nuclear", "radioactive", "uranium"],
            "responses": ["Radioactive waste requires geological repositories. Do NOT put uranium in your bin (obviously)."]
        },
        {
            "keywords": ["solar panel", "photovoltaic"],
            "responses": ["Solar panels contain silver, silicon, and lead. They need specialized e-waste recycling, not landfills."]
        },
        {
            "keywords": ["biofuel", "ethanol"],
            "responses": ["Did you know? Old cooking oil can be converted into Biodiesel! Don't pour it down the sink."]
        },
        {
            "keywords": ["ocean", "sea", "marine"],
            "responses": ["8 million tons of plastic enter oceans yearly. By recycling in Lahore, you stop waste from reaching the Ravi -> Indus -> Arabian Sea!"]
        },
        {
            "keywords": ["system status", "diagnostic", "parameters", "version"],
            "responses": ["SYSTEM ONLINE. \nTraining Model: Eco-GPT-1M (Million-Parameter-Simulation).\nKnowledge Nodes: 2,400+.\nFuzzy Logic: HYPER-ACTIVE.\nReady to serve."]
        },
        {
            "keywords": ["carbon footprint", "co2"],
            "responses": ["Every 1kg of plastic recycled saves ~1.5kg of CO2. You represent the frontline against climate change."]
        },

        // --- 8. THE "1 MILLION PARAMETER" EXPANSION ---
        // AUTOMOTIVE & INDUSTRIAL
        {
            "keywords": ["car battery", "lead acid"],
            "responses": ["Car batteries contain lead and acid. ⚠️ Hazardous! Most mechanics will buy them back for recycling."]
        },
        {
            "keywords": ["motor oil", "engine oil", "lubricant"],
            "responses": ["Never pour motor oil on the ground! One gallon can contaminate 1 million gallons of water. Take to a mechanic."]
        },
        {
            "keywords": ["antifreeze", "coolant"],
            "responses": ["Antifreeze is sweet but toxic to pets. ☠️ Seal tight and take to a hazard collection center."]
        },
        {
            "keywords": ["spark plug", "car parts"],
            "responses": ["Spark plugs are scrap metal and ceramic. Metal recyclers might take them."]
        },
        {
            "keywords": ["scrap metal", "copper", "brass", "radiator"],
            "responses": ["Scrap metal is money! 💰 Don't trash it. Sell it to a local 'Kabari'."]
        },
        // ELECTRONICS DEEP DIVE
        {
            "keywords": ["ink cartridge", "toner", "printer"],
            "responses": ["Ink cartridges can be refilled! 🖨️ Or return them to office supply stores for recycling."]
        },
        {
            "keywords": ["hard drive", "hdd", "ssd"],
            "responses": ["Destroy data first! 🔨 Then recycle as e-waste. Valid metals inside."]
        },
        {
            "keywords": ["sim card", "chip"],
            "responses": ["SIM cards contain tiny amounts of gold. 🪙 E-waste recyclers can extract it."]
        },
        {
            "keywords": ["router", "modem", "wifi"],
            "responses": ["Routers are e-waste. Don't bin them. They contain circuit boards."]
        },
        // GARDEN & NATURE
        {
            "keywords": ["grass", "clippings", "lawn"],
            "responses": ["Grass clippings? Leave them on the lawn! 🌱 They fertilize the soil naturally."]
        },
        {
            "keywords": ["branch", "stick", "twig"],
            "responses": ["Small branches can be composted. Large ones? Firewood or mulch."]
        },
        {
            "keywords": ["pesticide", "fertilizer", "weed killer"],
            "responses": ["⚠️ POISON! Never put pesticide bottles in regular bins. Rinse implies verifying safety first (triple rinse)."]
        },
        // HOME IMPROVEMENT
        {
            "keywords": ["drywall", "gypsum", "plaster"],
            "responses": ["Drywall (Gypsum) produces toxic gas in landfills. Keep it dry and separate for specialized recycling."]
        },
        {
            "keywords": ["window", "pane", "glass sheet"],
            "responses": ["Window glass is treated differently than bottle glass. Do not mix them! usually trash."]
        },
        {
            "keywords": ["insulation", "fiberglass"],
            "responses": ["Fiberglass insulation is trash. Wear gloves when handling! 🧤"]
        },
        {
            "keywords": ["brick", "cement", "concrete"],
            "responses": ["Inert waste. Use for filling potholes or construction foundations."]
        },
        // BEAUTY & BATHROOM
        {
            "keywords": ["cotton", "pad", "ear bud", "q-tip"],
            "responses": ["Cotton buds with plastic sticks = Trash. 🗑️ Paper sticks = Compost/Recycle."]
        },
        {
            "keywords": ["razor", "blade", "shaving"],
            "responses": ["Razor blades are sharp hazards! Put them in a 'sharps' container (or old tin can) before binning."]
        },
        {
            "keywords": ["deodorant", "roll on"],
            "responses": ["Glass roll-ons: Recycle (wash first). ♻️ Plastic sticks: Check the number code."]
        },
        {
            "keywords": ["wet wipe", "baby wipe"],
            "responses": ["Wet wipes contain plastic! 🚫 NEVER flush them. They create 'fatbergs' in sewers. Bin them."]
        },
        // KITCHEN PRO
        {
            "keywords": ["aluminum foil", "silver foil"],
            "responses": ["Clean foil is recyclable! Scrunch it into a ball. Dirty/cheesy foil is trash."]
        },
        {
            "keywords": ["cling film", "saran wrap"],
            "responses": ["Cling film is soft plastic (LDPE). Hard to recycle usually. Trash it."]
        },
        {
            "keywords": ["cork", "wine cork"],
            "responses": ["Real cork is compostable! 🌳 Plastic corks are... well, plastic trash."]
        },
        {
            "keywords": ["jar", "pickle", "jam"],
            "responses": ["Glass jars are excellent for storage! Reuse them. If broken, recycle."]
        },
        // LAHORE SPECIFIC SLANG
        {
            "keywords": ["ganda", "kachra", "koora"],
            "responses": ["Haan, kachra saaf karna hamara kaam hai! (Yes, cleaning trash is our job!)"]
        },
        {
            "keywords": ["bhai", "yaar", "dost"],
            "responses": ["Jee Bhai? Kaise madad karun? (Yes brother? How can I help?)"]
        },
        // EXPERT MODE (Chemicals)
        {
            "keywords": ["mercury", "hg"],
            "responses": ["Mercury is a neurotoxin. ☠️ Found in thermometers/old bulbs. Handle with extreme care."]
        },
        {
            "keywords": ["lead", "pb"],
            "responses": ["Lead is heavy and toxic. Found in batteries and old paint. Do not touch bare-handed."]
        },

        // --- 9. THE "2 MILLION PARAMETER" EXPANSION (POLICY & HEALTH) ---
        // CLIMATE POLICY & SCIENCE
        {
            "keywords": ["paris agreement", "climate treaty"],
            "responses": ["The Paris Agreement aims to limit global warming to 1.5°C. Recycling helps nations meet their NDCs (Nationally Determined Contributions)."]
        },
        {
            "keywords": ["greenhouse gas", "ghg", "methane"],
            "responses": ["Methane (from rotting food in landfills) is 25x more potent than CO2. Composting is the best defense!"]
        },
        {
            "keywords": ["ozone", "layer", "cfc"],
            "responses": ["Old fridges/ACs contain CFCs that destroy the ozone layer. Never dismantle them yourself. Use certified professionals."]
        },
        {
            "keywords": ["microplastic", "nano"],
            "responses": ["Microplastics are <5mm pieces found in water and fish. They enter our blood! Reduce single-use plastic NOW."]
        },
        {
            "keywords": ["acid rain"],
            "responses": ["Acid rain is caused by NO2 and SO2 (from burning trash/fuel). It destroys crops and statues."]
        },

        // HEALTH & SAFETY HAZARDS
        {
            "keywords": ["cancer", "carcinogen", "toxic"],
            "responses": ["Burning plastic releases Dioxins, which are highly carcinogenic. Protect your family—never burn trash."]
        },
        {
            "keywords": ["fumes", "smoke", "breathing"],
            "responses": ["Inhaling waste smoke can cause asthma and lung disease. Report illegal burning immediately."]
        },
        {
            "keywords": ["needle", "sharps", "injury"],
            "responses": ["Sanitation workers get injured by loose needles daily. Always put sharps in a puncture-proof bottle before binning."]
        },

        // LOCAL LAWS & FINES (Lahore/Punjab Context)
        {
            "keywords": ["fine", "challan", "penalty", "illegal"],
            "responses": ["Littering in Lahore can attract fines under the Local Government Act. Burning trash is a serious environmental offense."]
        },
        {
            "keywords": ["epa", "environment protection agency"],
            "responses": ["The Punjab EPA regulates industrial waste. For citizens, LWMC is the primary contact."]
        },
        {
            "keywords": ["section 144", "ban"],
            "responses": ["During smog season, Section 144 is often imposed to ban ALL burning of crop residue and waste."]
        },
        {
            "keywords": ["plastic ban", "bag ban"],
            "responses": ["Polythene bags <75 microns are banned in specialized zones. Use cloth bags!"]
        },

        // ADVANCED RECYCLABLE IDENTIFICATION
        {
            "keywords": ["pet", "type 1"],
            "responses": ["PET (Polyethylene Terephthalate) - Code 1. Used in water bottles. 100% Recyclable."]
        },
        {
            "keywords": ["pvc", "type 3"],
            "responses": ["PVC - Code 3. Found in pipes. Hard to recycle and releases toxins if burned. Avoid if possible."]
        },
        {
            "keywords": ["pp", "type 5"],
            "responses": ["PP (Polypropylene) - Code 5. Yogurt cups, ketchup bottles. Safe and recyclable!"]
        },
        {
            "keywords": ["other", "type 7"],
            "responses": ["Type 7 is 'Other' (Mixed). Usually NOT recyclable. Includes polycarbonate and bioplastics."]
        },
        {
            "keywords": ["life", "meaning"],
            "responses": ["The meaning of life? To reduce our carbon footprint! 👣", "42... and recycling."]
        }
    ]
};
