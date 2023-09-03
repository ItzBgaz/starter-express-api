const axios = require('axios'),
   qrcode = require('qrcode'),
   cheerio = require('cheerio'),
   moment = require('moment-timezone')

module.exports = class Saweria {
   constructor(user_id) {
      this.user_id = user_id
      this.baseUrl = 'https://saweria.co'
      this.apiUrl = 'https://backend.saweria.co'
   }

   login = (email, password) => {
      return new Promise(async resolve => {
         try {
            const json = await (await axios.post(this.apiUrl + '/auth/login', {
               email,
               password
            }, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": `${this.baseUrl}/`,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            }))
            if (!json.data.data || !json.data.data.id) return resolve({
               creator: global.creator,
               status: false,
               msg: e.message
            })
            resolve({
               creator: global.creator,
               status: true,
               data: {
                  user_id: json.data.data.id
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: global.creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   createPayment = (amount, msg = 'Order') => {
      return new Promise(async resolve => {
         try {
            if (!this.user_id) return resolve({
               creator: global.creator,
               status: false,
               msg: 'USER ID NOT FOUND'
            })
            const json = await (await axios.post(this.apiUrl + '/donations/' + this.user_id, {
               agree: true,
               amount: Number(amount),
               customer_info: {
                  first_name: 'Payment Gateway',
                  email: 'aaa@null.net',
                  phone: '',
               },
               message: msg,
               notUnderAge: true,
               payment_type: 'qris',
               vote: ''
            }, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": `${this.baseUrl}/`,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            })).data
            if (!json || !json.data || !json.data.id) return resolve({
               creator: global.creator,
               status: false,
               msg: 'ERROR!'
            })
            resolve({
               creator: global.creator,
               status: true,
               data: {
                  ...json.data,
                  expired_at: moment(json.data.created_at).add(10, 'minutes').format('DD/MM/YYYY HH:mm:ss'),
                  receipt: this.baseUrl + '/qris/' + json.data.id,
                  url: this.baseUrl + '/qris/' + json.data.id,
                  qr_image: await qrcode.toDataURL(json.data.qr_string, {
                     scale: 8
                  })
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: global.creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   checkPayment = id => {
      return new Promise(async resolve => {
         try {
            if (!this.user_id) return resolve({
               creator: global.creator,
               status: false,
               msg: 'USER ID NOT FOUND'
            })
            const html = await (await axios.get(this.baseUrl + '/receipt/' + id, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": this.baseUrl + '/receipt/' + id,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            })).data
            const $ = cheerio.load(html)
            const msg = $('h2[class="chakra-heading css-14dtuui"]').text()
            if (!msg) return resolve({
               creator: global.creator,
               status: false,
               msg: 'TRANSAKSI TIDAK TERDAFTAR ATAU BELUM TERSELESAIKAN'
            })
            const status = msg.toLowerCase() == 'berhasil' ? true : false
            resolve({
               creator: global.creator,
               status,
               msg: msg.toUpperCase()
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: global.creator,
               status: false,
               msg: e.message
            })
         }
      })
   }
}