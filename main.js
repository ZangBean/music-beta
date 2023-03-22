const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8-PLAYER'

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRamdom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [  
        {
            name: 'Without Me',
            singer: 'Halsey',
            path: './assets/music/Without_Me-Halsey.mp3',
            image: './assets/img/without_me.jpg'
        },
        {
            name: 'Symphony',
            singer: 'Clean Bandit',
            path: './assets/music/Symphony-CleanBanditZaraLarsson.mp3',
            image: './assets/img/symphony1.jpg'
        },
        {
            name: 'Title',
            singer: 'Meghan Trainor',
            path: './assets/music/Title-MeghanTrainor.mp3',
            image: './assets/img/title.jpg'
        },
        {
            name: 'Howl\'s Moving Castle',
            singer: 'Joe Hisaishi',
            path: './assets/music/MerryGoRound-JoeHisaishi.mp3',
            image: './assets/img/piano1.jpg'
        },
        {
            name: 'Apollo',
            singer: 'Timebelle',
            path: './assets/music/Apollo-Nightcore,Timebelle.mp3',
            image: './assets/img/apollo1.jpg'
        },
        {
            name: 'Nandemonaiya',
            singer: 'Radwimps',
            path: './assets/music/Nandemonaiya.mp3',
            image: './assets/img/nandemonaiya1.jpg'
        },
        {
            name: 'Tada Koe Hitotsue',
            singer: 'Rokudenashi',
            path: './assets/music/All_For_Love-Tungevaag-Raaban.mp3',
            image: './assets/img/tada koe hitotsu.jpg'
        },
        {
            name: 'Harehareya',
            singer: 'Maigo Hanyuu',
            path: './assets/music/感情を込めてハレハレヤ 歌ってみた.mp3',
            image: './assets/img/stream harehare1.jpg'
        },
        {
            name: 'All For Love',
            singer: 'Tungevaag, Raaban',
            path: './assets/music/All_For_Love-Tungevaag-Raaban.mp3',
            image: './assets/img/all_for_love1.jpg'
        },
        {
            name: 'Nothing On You',
            singer: 'Barry Brizzy',
            path: './assets/music/Nothing_on_You-Barry-Brizzy.mp3',
            image: './assets/img/nothingOnYou.jpg'
        }
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" 
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },
    defineProperty: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay, dừng
        const cdThumbAnimate = cdThumb.animate([
            {   
                transform: 'rotate(360deg)'
            }
        ], {
                duration: 10000, // 10 seconds
                iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px':0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying){
                audio.pause()
            }else{
                audio.play()
            }
        }
        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        // Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRamdom){
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRamdom){
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Xử lý bật / tắc ramdom song
        randomBtn.onclick = function(e) {
            _this.isRamdom = !_this.isRamdom
            _this.setConfig('isRamdom', _this.isRamdom)
            randomBtn.classList.toggle('active', _this.isRamdom)
        }
        // Xử lý repeat song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // Xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }
        // Lắng nghe hành vi click vào playList
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const songOption = e.target.closest('option')
            if(songNode || !songOption){
               // Xử lý khi click vào song
               if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
               }
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block:'center',
            })
        }, 250)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRamdom = this.config.isRamdom
        this.isRepeat = this.config.isRepeat
    },
    nextSong : function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong() 
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong() 
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        this.defineProperty()// Định nghĩa thuộc tính cho objective
        
        this.handleEvents()// Lắng nghe, xử lý sự kiện (DOM events)
        
        this.loadCurrentSong()// Tải thông tin bài hát đầu tiên khi chạy ứng dụng
        
        this.render() //Render playlistS
    }
}

app.start()