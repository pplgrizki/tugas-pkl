
"use strict";


const PATH = {
    welcome: "images/Zull x Miku/foto berdua.jpg",
    zull: "images/Zull/",
    miku: "images/Miku/",
    background: "images/background/",
    ending: "images/Zull x Miku/",
    sounds: "sounds/"
};

const backgrounds = {
    taman: "taman-kota.jpg",
    hujan: "halte-hujan.jpg",
    buku: "toko-buku.jpg",
    festival: "festival-malam.jpg",
    stasiun: "stasiun.jpg",
    sekolah: "sekolah.jpg"
};

const endingAssets = {
    good: {
        title: "GOOD ENDING — BERSAMA SELAMANYA",
        description:
            "Setelah melewati berbagai masalah, Zull dan Miku akhirnya jujur tentang perasaan mereka. Mereka memilih untuk saling percaya dan menghadapi masa depan bersama.",
        image: "Good Ending.jpg",
        sound: "good-ending.mp3"
    },

    sad: {
        title: "SAD ENDING — PERPISAHAN",
        description:
            "Tidak semua perasaan bisa dipertahankan. Miku akhirnya pergi, sementara Zull belajar menerima bahwa terkadang mencintai seseorang berarti membiarkannya memilih jalannya sendiri.",
        image: "Sad Ending.jpg",
        sound: "colorwide-sway.mp3"
    },

    mystery: {
        title: "MYSTERY ENDING — JEJAK YANG TERTINGGAL",
        description:
            "Miku menghilang tanpa penjelasan. Zull hanya menemukan sebuah pesan dan petunjuk yang mengarah pada rahasia yang selama ini disembunyikan Miku.",
        image: "Mystery Ending.jpg",
        sound: "mystery-ending.mp3"
    },

    secret: {
        title: "SECRET ENDING — RAHASIA DI BALIK TAKDIR",
        description:
            "Pilihan-pilihan Zull membawanya menemukan kebenaran yang tidak pernah diceritakan Miku. Sebuah rahasia mengubah cara mereka memandang seluruh perjalanan yang telah dilalui.",
        image: "Secret Ending.jpg",
        sound: "secret-ending.mp3"
    }
};

// ==================================================
// 2. CERITA 12 CHAPTER
// ==================================================

const chapters = [
    {
        title: "Pertemuan di Bawah Langit Senja",
        location: "Taman Kota",
        background: backgrounds.taman,
        dialogues: [
            {
                speaker: "Zull",
                text: "Akhirnya selesai juga. Sepertinya hari ini bakal jadi hari biasa.",
                japanese: "やっと終わった。今日は普通の日になりそうだ。",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Zull? Kamu sedang sendirian?",
                japanese: "ズール？一人でいるの？",
                expression: "normal"
            },
            {
                speaker: "Zull",
                text: "Miku? Aku tidak menyangka bakal bertemu kamu di sini.",
                japanese: "ミク？ここで会うなんて思わなかった。",
                expression: "terkejut"
            }
        ],
        choices: [
            {
                text: "Ajak Miku berjalan bersama.",
                effects: { trust: 1, respect: 1 }
            },
            {
                text: "Sapa Miku dengan malu-malu.",
                effects: { trust: 1, honesty: 1 }
            },
            {
                text: "Pamit dan pulang sendiri.",
                effects: { letGo: true, trust: -1 }
            }
        ]
    },

    {
        title: "Rahasia di Balik Senyuman",
        location: "Taman Kota",
        background: backgrounds.taman,
        dialogues: [
            {
                speaker: "Miku",
                text: "Akhir-akhir ini aku sering datang ke sini. Ada sesuatu yang ingin kupikirkan.",
                japanese: "最近、よくここに来るの。考えたいことがあるから。",
                expression: "sedih"
            },
            {
                speaker: "Zull",
                text: "Kalau ada masalah, kamu boleh cerita kepadaku.",
                japanese: "悩みがあるなら、僕に話してもいいよ。",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Kamu benar-benar mau mendengarkanku?",
                japanese: "本当に私の話を聞いてくれるの？",
                expression: "terkejut"
            }
        ],
        choices: [
            {
                text: "Aku akan mendengarkan tanpa menghakimi.",
                effects: { trust: 2, respect: 1 }
            },
            {
                text: "Kamu harus menceritakan semuanya sekarang.",
                effects: { honesty: 1, respect: -1 }
            },
            {
                text: "Kalau belum siap, aku tidak akan memaksa.",
                effects: { respect: 2, trust: 1 }
            }
        ]
    },

    {
        title: "Hujan yang Tidak Terduga",
        location: "Halte Saat Hujan",
        background: backgrounds.hujan,
        dialogues: [
            {
                speaker: "Miku",
                text: "Yah, hujannya deras sekali. Kita tidak bisa pergi sekarang.",
                japanese: "ああ、雨がすごく強いね。今は帰れそうにないね。",
                expression: "terkejut"
            },
            {
                speaker: "Zull",
                text: "Kamu kedinginan? Pakai jaketku dulu.",
                japanese: "寒いの？僕の上着を着ていいよ。",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Terima kasih, Zull. Kamu selalu memikirkan orang lain.",
                japanese: "ありがとう、ズール。いつも人のことを考えてくれるね。",
                expression: "malu"
            }
        ],
        choices: [
            {
                text: "Aku cuma tidak ingin kamu sakit.",
                effects: { trust: 2, honesty: 1 }
            },
            {
                text: "Jangan salah paham, aku cuma kebetulan membawa jaket.",
                effects: { trust: -1 }
            },
            {
                text: "Aku senang kalau bisa membuatmu nyaman.",
                effects: { trust: 1, respect: 1 }
            }
        ]
    },

    {
        title: "Buku dan Kenangan",
        location: "Toko Buku",
        background: backgrounds.buku,
        dialogues: [
            {
                speaker: "Miku",
                text: "Aku suka tempat ini. Rasanya seperti bisa masuk ke dunia lain.",
                japanese: "この場所が好きなの。本当に別の世界に入れる気がする。",
                expression: "senang"
            },
            {
                speaker: "Zull",
                text: "Kalau begitu, buku seperti apa yang kamu suka?",
                japanese: "じゃあ、どんな本が好きなの？",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Cerita tentang orang-orang yang tetap bersama meskipun semuanya sulit.",
                japanese: "どんなに大変でも、一緒にいる人たちの物語が好き。",
                expression: "sedih"
            }
        ],
        choices: [
            {
                text: "Aku juga ingin punya hubungan seperti itu.",
                effects: { honesty: 1, trust: 2 }
            },
            {
                text: "Menurutku cerita seperti itu terlalu sempurna.",
                effects: { trust: -1 }
            },
            {
                text: "Hubungan yang baik memang butuh usaha bersama.",
                effects: { respect: 2, honesty: 1 }
            }
        ]
    },

    {
        title: "Festival di Malam Hari",
        location: "Festival Malam",
        background: backgrounds.festival,
        dialogues: [
            {
                speaker: "Miku",
                text: "Lampionnya indah sekali. Aku ingin mengingat malam ini.",
                japanese: "提灯がとてもきれい。今夜のことを覚えていたいな。",
                expression: "senang"
            },
            {
                speaker: "Zull",
                text: "Kalau begitu, bagaimana kalau kita mengambil foto bersama?",
                japanese: "じゃあ、一緒に写真を撮らない？",
                expression: "malu"
            },
            {
                speaker: "Miku",
                text: "Foto bersama? Boleh... tapi jangan menertawakanku, ya.",
                japanese: "一緒に写真？いいよ……でも、笑わないでね。",
                expression: "malu"
            }
        ],
        choices: [
            {
                text: "Janji. Aku ingin menyimpan kenangan ini.",
                effects: { promise: true, trust: 2, honesty: 1 }
            },
            {
                text: "Tenang saja, aku tidak akan menyimpannya.",
                effects: { trust: -1 }
            },
            {
                text: "Kamu terlihat bahagia malam ini.",
                effects: { respect: 1, trust: 1 }
            }
        ]
    },

    {
        title: "Pesan yang Disembunyikan",
        location: "Sekolah",
        background: backgrounds.sekolah,
        dialogues: [
            {
                speaker: "Zull",
                text: "Miku, tadi aku menemukan catatan ini. Apa kamu tahu siapa pemiliknya?",
                japanese: "ミク、このメモを見つけたんだ。誰のものか知ってる？",
                expression: "terkejut"
            },
            {
                speaker: "Miku",
                text: "Dari mana kamu mendapatkannya? Itu... tidak penting.",
                japanese: "どこでそれを見つけたの？それは……大事なことじゃないよ。",
                expression: "takut"
            },
            {
                speaker: "Zull",
                text: "Kamu terlihat takut. Apakah catatan ini ada hubungannya denganmu?",
                japanese: "怖がっているように見える。このメモは君と関係があるの？",
                expression: "normal"
            }
        ],
        choices: [
            {
                text: "Tanyakan baik-baik tanpa memaksanya.",
                effects: { honesty: 1, respect: 2, mysteryClue: 1 }
            },
            {
                text: "Sembunyikan catatan itu dan cari tahu sendiri.",
                effects: { secret: 1, mysteryClue: 2 }
            },
            {
                text: "Kembalikan catatan itu dan berhenti bertanya.",
                effects: { letGo: true, trust: -1 }
            }
        ]
    },

    {
        title: "Jarak di Antara Kita",
        location: "Halte Saat Hujan",
        background: backgrounds.hujan,
        dialogues: [
            {
                speaker: "Miku",
                text: "Zull, belakangan ini aku merasa semuanya berubah.",
                japanese: "ズール、最近、何もかも変わってしまった気がする。",
                expression: "sedih"
            },
            {
                speaker: "Zull",
                text: "Kalau ada sesuatu yang mengganggumu, aku ingin tahu.",
                japanese: "何か悩んでいるなら、僕は知りたい。",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Aku takut kalau kamu tahu semuanya, kamu akan pergi.",
                japanese: "全部を知ったら、あなたが離れてしまうのが怖い。",
                expression: "menangis_sedih"
            }
        ],
        choices: [
            {
                text: "Aku tidak bisa menjanjikan semuanya mudah, tapi aku mau mencoba.",
                effects: { trust: 2, honesty: 2, promise: true }
            },
            {
                text: "Kalau kamu tidak percaya padaku, terserah.",
                effects: { trust: -2, letGo: true }
            },
            {
                text: "Aku tidak akan memaksamu bercerita sebelum siap.",
                effects: { respect: 2, trust: 1 }
            }
        ]
    },

    {
        title: "Petunjuk di Stasiun",
        location: "Stasiun",
        background: backgrounds.stasiun,
        dialogues: [
            {
                speaker: "Zull",
                text: "Catatan ini menyebutkan stasiun. Kenapa Miku menyembunyikan sesuatu di sini?",
                japanese: "このメモには駅のことが書いてある。なぜミクはここに何かを隠したんだ？",
                expression: "terkejut"
            },
            {
                speaker: "Miku",
                text: "Kamu seharusnya tidak datang ke sini, Zull.",
                japanese: "ズール、ここに来るべきじゃなかったのに。",
                expression: "takut"
            },
            {
                speaker: "Zull",
                text: "Aku hanya ingin mengerti apa yang sebenarnya terjadi.",
                japanese: "僕は本当は何が起きているのか知りたいだけだ。",
                expression: "normal"
            }
        ],
        choices: [
            {
                text: "Tunjukkan catatan itu dan minta penjelasan.",
                effects: { honesty: 1, mysteryClue: 2, trust: 1 }
            },
            {
                text: "Ikuti petunjuk diam-diam untuk mencari kebenaran.",
                effects: { secret: 2, mysteryClue: 2 }
            },
            {
                text: "Berhenti menyelidiki dan percayakan keputusan kepada Miku.",
                effects: { respect: 2, letGo: true }
            }
        ]
    },

    {
        title: "Janji yang Hampir Hilang",
        location: "Taman Kota",
        background: backgrounds.taman,
        dialogues: [
            {
                speaker: "Miku",
                text: "Kamu masih ingat janji kita saat festival?",
                japanese: "お祭りのときの約束、まだ覚えてる？",
                expression: "sedih"
            },
            {
                speaker: "Zull",
                text: "Tentu. Aku tidak ingin kenangan itu menjadi sesuatu yang kita sesali.",
                japanese: "もちろん。あの思い出を後悔にしたくない。",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Kalau begitu, kali ini aku ingin kamu memilih dengan jujur.",
                japanese: "それなら、今度は正直に選んでほしい。",
                expression: "normal"
            }
        ],
        choices: [
            {
                text: "Aku ingin tetap bersamamu dan memperbaiki semuanya.",
                effects: { trust: 2, honesty: 1, promise: true }
            },
            {
                text: "Aku akan menghormati apa pun keputusanmu.",
                effects: { respect: 2, honesty: 1, letGo: true }
            },
            {
                text: "Aku ingin tahu seluruh rahasia yang kamu simpan.",
                effects: { secret: 2, mysteryClue: 1, honesty: 1 }
            }
        ]
    },

    {
        title: "Kebenaran di Balik Catatan",
        location: "Toko Buku",
        background: backgrounds.buku,
        dialogues: [
            {
                speaker: "Zull",
                text: "Aku menemukan halaman yang tersembunyi di buku ini. Ada namamu di dalamnya.",
                japanese: "この本に隠されたページを見つけた。そこに君の名前がある。",
                expression: "terkejut"
            },
            {
                speaker: "Miku",
                text: "Jadi kamu sudah menemukan petunjuknya...",
                japanese: "そう……手がかりを見つけたんだね。",
                expression: "sedih"
            },
            {
                speaker: "Zull",
                text: "Miku, aku tidak ingin kehilanganmu hanya karena sebuah rahasia.",
                japanese: "ミク、秘密のせいで君を失いたくない。",
                expression: "sedih"
            }
        ],
        choices: [
            {
                text: "Aku ingin mendengar kebenaran darimu sendiri.",
                effects: { honesty: 2, trust: 1, mysteryClue: 1 }
            },
            {
                text: "Aku sudah tahu cukup banyak. Aku akan mencari sisanya.",
                effects: { secret: 2, mysteryClue: 2 }
            },
            {
                text: "Kamu tidak harus menceritakan semuanya kepadaku.",
                effects: { respect: 2, trust: 1 }
            }
        ]
    },

    {
        title: "Pilihan Terakhir",
        location: "Stasiun",
        background: backgrounds.stasiun,
        dialogues: [
            {
                speaker: "Miku",
                text: "Zull, mungkin setelah malam ini semuanya akan berubah.",
                japanese: "ズール、今夜が終わったら、すべてが変わるかもしれない。",
                expression: "menangis_sedih"
            },
            {
                speaker: "Zull",
                text: "Aku tidak bisa mengubah masa lalu, tapi aku masih bisa menentukan pilihanku sekarang.",
                japanese: "過去は変えられない。でも、今の選択は自分で決められる。",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Kalau begitu, tunjukkan kepadaku apa yang benar-benar kamu inginkan.",
                japanese: "それなら、本当に望んでいることを見せて。",
                expression: "normal"
            }
        ],
        choices: [
            {
                text: "Aku memilihmu. Mari hadapi semuanya bersama.",
                effects: { trust: 2, honesty: 1, respect: 1, promise: true }
            },
            {
                text: "Aku akan membiarkanmu pergi jika itu yang kamu inginkan.",
                effects: { respect: 2, letGo: true }
            },
            {
                text: "Aku akan membuka semua petunjuk sampai rahasianya terungkap.",
                effects: { secret: 2, mysteryClue: 2 }
            }
        ]
    },

    {
        title: "Di Antara Hujan dan Kamu",
        location: "Festival Malam",
        background: backgrounds.festival,
        dialogues: [
            {
                speaker: "Miku",
                text: "Terima kasih karena sudah berjalan sejauh ini bersamaku, Zull.",
                japanese: "ここまで一緒に歩いてくれて、ありがとう、ズール。",
                expression: "sedih"
            },
            {
                speaker: "Zull",
                text: "Apa pun yang terjadi setelah ini, aku ingin pilihan kita berarti.",
                japanese: "この先何が起きても、僕たちの選択に意味があってほしい。",
                expression: "normal"
            },
            {
                speaker: "Miku",
                text: "Kalau begitu... ini adalah pilihan terakhir kita.",
                japanese: "それなら……これが私たちの最後の選択だね。",
                expression: "normal"
            }
        ],
        choices: [
            {
                text: "Pegang janji dan tetap bersama Miku.",
                effects: { trust: 2, honesty: 1, respect: 1, promise: true }
            },
            {
                text: "Lepaskan Miku dan terima keputusannya.",
                effects: { respect: 2, letGo: true }
            },
            {
                text: "Gabungkan semua petunjuk untuk membuka rahasia terakhir.",
                effects: {
                    secret: 2,
                    secretChoices: 1,
                    mysteryClue: 1,
                    honesty: 1
                }
            }
        ]
    }
];

// ==================================================
// 3. STATUS PERMAINAN
// ==================================================

let currentChapter = 0;
let currentDialogue = 0;
let history = [];
let stats = {};
let endingAudio = null;
let currentEnding = null;
let currentUtterance = null;

const $ = (id) => document.getElementById(id);

function resetStats() {
    stats = {
        trust: 0,
        honesty: 0,
        respect: 0,
        secret: 0,
        promise: false,
        letGo: false,
        mysteryClue: 0,
        secretChoices: 0
    };

    currentChapter = 0;
    currentDialogue = 0;
    history = [];
    currentEnding = null;
}

// ==================================================
// 4. NAVIGASI LAYAR
// ==================================================

function showScreen(activeScreen) {
    ["welcomeScreen", "storyScreen", "endingScreen"].forEach((id) => {
        const screen = $(id);
        if (!screen) return;

        const active = id === activeScreen;
        screen.hidden = !active;
        screen.classList.toggle("active", active);
    });
}

// ==================================================
// 5. AUDIO ENDING
// ==================================================

function stopEndingSound() {
    if (endingAudio) {
        endingAudio.pause();
        endingAudio.currentTime = 0;
        endingAudio = null;
    }
}

function ensureReplayButton() {
    const endingScreen = $("endingScreen");
    if (!endingScreen) return;

    let button = $("replayEndingSoundBtn");

    if (!button) {
        button = document.createElement("button");
        button.id = "replayEndingSoundBtn";
        button.type = "button";
        button.className = "choice-button";
        button.textContent = "🔊 Putar Suara Ending Lagi";
        endingScreen.appendChild(button);
    }

    button.onclick = () => {
        if (currentEnding && endingAssets[currentEnding]) {
            playEndingSound(endingAssets[currentEnding].sound);
        }
    };
}

function playEndingSound(filename) {
    stopEndingSound();

    if (!filename) {
        console.error("Nama file suara ending kosong!");
        return;
    }

    const audioPath = new URL(
        PATH.sounds + filename,
        document.baseURI
    ).href;

    const audio = new Audio();
    endingAudio = audio;

    audio.src = audioPath;
    audio.loop = true;
    audio.volume = 0.8;
    audio.preload = "auto";

    audio.addEventListener("canplay", () => {
        console.log("Audio siap diputar:", audioPath);
    }, { once: true });

    audio.addEventListener("error", () => {
        console.error(
            "Audio gagal dimuat. Periksa file dan formatnya:",
            audioPath,
            audio.error
        );
        ensureReplayButton();
    }, { once: true });

    audio.play().catch((error) => {
        console.warn("Audio belum bisa diputar otomatis:", error);
        ensureReplayButton();
    });
}

// ==================================================
// 6. GAMBAR KARAKTER
// ==================================================

function setImage(element, path, fallbackPath = "") {
    if (!element) return;

    element.onerror = null;
    element.onload = null;

    element.onerror = () => {
        if (fallbackPath) {
            const fallbackURL = new URL(
                fallbackPath,
                document.baseURI
            ).href;

            if (element.src !== fallbackURL) {
                element.onerror = () => {
                    element.hidden = true;
                };
                element.src = fallbackPath;
            } else {
                element.hidden = true;
            }
        } else {
            element.hidden = true;
        }
    };

    element.onload = () => {
        element.hidden = false;
    };

    element.src = path;
}

function getCharacterPath(speaker, expression) {
    const file = `${speaker.toLowerCase()}_${expression || "normal"}.jpg`;

    if (speaker === "Zull") return PATH.zull + file;
    if (speaker === "Miku") return PATH.miku + file;

    return "";
}

function updateCharacters(dialogue) {
    const zull = $("zullImage");
    const miku = $("mikuImage");

    if (zull) zull.hidden = true;
    if (miku) miku.hidden = true;

    if (!dialogue) return;

    const expression = dialogue.expression || "normal";

    if (dialogue.speaker === "Zull") {
        setImage(
            zull,
            getCharacterPath("Zull", expression),
            getCharacterPath("Zull", "normal")
        );
    } else if (dialogue.speaker === "Miku") {
        setImage(
            miku,
            getCharacterPath("Miku", expression),
            getCharacterPath("Miku", "normal")
        );
    }
}

// ==================================================
// 7. SUARA DIALOG JEPANG
// ==================================================

function getJapaneseVoice() {
    if (!("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();

    return voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("ja")
    ) || null;
}

function speakDialogue(dialogue) {
    const voiceMode = $("voiceMode");

    if (!voiceMode || voiceMode.value !== "on") return;
    if (!("speechSynthesis" in window)) return;
    if (!dialogue.japanese) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(dialogue.japanese);
    const japaneseVoice = getJapaneseVoice();

    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    utterance.pitch = dialogue.speaker === "Miku" ? 1.2 : 0.95;

    if (japaneseVoice) {
        utterance.voice = japaneseVoice;
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
}

// ==================================================
// 8. MULAI PERMAINAN
// ==================================================

function startGame() {
    stopEndingSound();

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    resetStats();
    showScreen("storyScreen");
    renderChapter();
}

// ==================================================
// 9. TAMPILKAN CHAPTER
// ==================================================

function renderChapter() {
    const chapter = chapters[currentChapter];

    if (!chapter) {
        showEnding();
        return;
    }

    const counter = $("chapterCounter");
    const title = $("chapterTitle");
    const location = $("locationName");
    const choices = $("choicesContainer");

    if (counter) {
        counter.textContent = `BAB ${currentChapter + 1} / ${chapters.length}`;
    }

    if (title) title.textContent = chapter.title;
    if (location) location.textContent = chapter.location;

    if (choices) {
        choices.innerHTML = "";
        choices.hidden = true;
        choices.style.display = "none";
    }

    setImage(
        $("backgroundImage"),
        PATH.background + chapter.background
    );

    currentDialogue = Math.min(
        currentDialogue,
        chapter.dialogues.length - 1
    );

    renderDialogue();
}

// ==================================================
// 10. TAMPILKAN DIALOG
// ==================================================

function renderDialogue() {
    const chapter = chapters[currentChapter];
    if (!chapter) return;

    const dialogue = chapter.dialogues[currentDialogue];
    if (!dialogue) {
        showChoices();
        return;
    }

    const speakerName = $("speakerName");
    const dialogueText = $("dialogueText");
    const backButton = $("backButton");
    const nextButton = $("nextButton");
    const choices = $("choicesContainer");

    if (speakerName) speakerName.textContent = dialogue.speaker;
    if (dialogueText) dialogueText.textContent = dialogue.text;

    updateCharacters(dialogue);
    speakDialogue(dialogue);

    if (backButton) {
        backButton.disabled = history.length === 0;
    }

    if (nextButton) {
        nextButton.hidden = false;
        nextButton.disabled = false;
        nextButton.textContent =
            currentDialogue === chapter.dialogues.length - 1
                ? "Pilih Jawaban →"
                : "Lanjut →";
    }

    if (choices) {
        choices.hidden = true;
        choices.style.display = "none";
    }
}

// ==================================================
// 11. LANJUT DIALOG
// ==================================================

function nextDialogue() {
    const chapter = chapters[currentChapter];
    if (!chapter) return;

    if (currentDialogue < chapter.dialogues.length - 1) {
        history.push({
            chapter: currentChapter,
            dialogue: currentDialogue,
            stats: { ...stats }
        });

        currentDialogue++;
        renderDialogue();
    } else {
        showChoices();
    }
}

// ==================================================
// 12. KEMBALI KE DIALOG SEBELUMNYA
// ==================================================

function previousDialogue() {
    if (history.length === 0) return;

    const previous = history.pop();

    currentChapter = previous.chapter;
    currentDialogue = previous.dialogue;
    stats = { ...previous.stats };

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    renderChapter();
}

// ==================================================
// 13. TAMPILKAN PILIHAN
// ==================================================

function showChoices() {
    const chapter = chapters[currentChapter];
    if (!chapter) return;

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    const speakerName = $("speakerName");
    const dialogueText = $("dialogueText");
    const zull = $("zullImage");
    const miku = $("mikuImage");
    const container = $("choicesContainer");
    const nextButton = $("nextButton");

    if (speakerName) speakerName.textContent = "Pilihanmu";

    if (dialogueText) {
        dialogueText.textContent =
            "Pilih jawabanmu dengan hati-hati. Pilihanmu akan memengaruhi hubungan Zull dan Miku serta menentukan ending cerita.";
    }

    if (zull) zull.hidden = true;
    if (miku) miku.hidden = true;
    if (nextButton) nextButton.hidden = true;
    if (!container) return;

    container.innerHTML = "";
    container.hidden = false;
    container.style.display = "flex";

    chapter.choices.forEach((choice) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "choice-button";
        button.textContent = choice.text;

        button.addEventListener("click", () => selectChoice(choice));

        container.appendChild(button);
    });
}

// ==================================================
// 14. PROSES PILIHAN
// ==================================================

function selectChoice(choice) {
    history.push({
        chapter: currentChapter,
        dialogue: currentDialogue,
        stats: { ...stats }
    });

    Object.entries(choice.effects || {}).forEach(([key, value]) => {
        if (typeof value === "boolean") {
            stats[key] = value;
        } else {
            stats[key] = (stats[key] || 0) + value;
        }
    });

    currentChapter++;

    if (currentChapter >= chapters.length) {
        showEnding();
    } else {
        currentDialogue = 0;
        renderChapter();
    }
}

// ==================================================
// 15. TENTUKAN ENDING
// ==================================================

function determineEnding() {
    if (
        stats.secret >= 5 &&
        stats.secretChoices >= 1 &&
        stats.honesty >= 2 &&
        stats.mysteryClue >= 1
    ) {
        return "secret";
    }

    if (stats.secret >= 3 && stats.mysteryClue >= 1) {
        return "mystery";
    }

    if (
        stats.trust >= 7 &&
        stats.honesty >= 2 &&
        stats.respect >= 2 &&
        stats.promise === true &&
        stats.letGo === false
    ) {
        return "good";
    }

    return "sad";
}

// ==================================================
// 16. TAMPILKAN ENDING
// ==================================================

function showEnding() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    const endingKey = determineEnding();
    const ending = endingAssets[endingKey];

    currentEnding = endingKey;
    showScreen("endingScreen");

    const title = $("endingTitle");
    const description = $("endingDescription");

    if (title) title.textContent = ending.title;
    if (description) description.textContent = ending.description;

    setImage(
        $("endingImage"),
        PATH.ending + ending.image
    );

    ensureReplayButton();
    playEndingSound(ending.sound);
}

// ==================================================
// 17. MAIN LAGI
// ==================================================

function restartGame() {
    stopEndingSound();

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    resetStats();
    showScreen("welcomeScreen");
}

// ==================================================
// 18. HUBUNGKAN TOMBOL HTML
// ==================================================

function bindButton(id, callback) {
    const button = $(id);

    if (button) {
        button.addEventListener("click", callback);
    } else {
        console.warn(`Tombol dengan ID "${id}" tidak ditemukan.`);
    }
}

bindButton("startButton", startGame);
bindButton("nextButton", nextDialogue);
bindButton("backButton", previousDialogue);
bindButton("restartButton", restartGame);

// ==================================================
// 19. HENTIKAN AUDIO SAAT KELUAR
// ==================================================

window.addEventListener("pagehide", () => {
    stopEndingSound();

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
});

if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
}

showScreen("welcomeScreen");
