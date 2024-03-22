const app = Vue.createApp({
    data() {
        return {
            months: ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augstus","September","Oktober","November","December"],
            product: [],
            image: './assets/images/socks_blue.jpg',
            inStock: true,
            details: ['50% cotton', '30% wool', '20% polyester'],
            month: '',
            previousElement: null
        }
    },
    methods: {
        processData(data) {
            this.product = [];
            data.forEach(i => {
                var searchItem = this.product.find(x => x.category === i.category);
                if(!searchItem){
                    this.product.push({category: i.category, data: [i]})
                } else {
                    searchItem.data.push(i);
                }
            });
        },
        retrieveCurrentMonth() {
            const currentDate = new Date();
            this.month = this.months[currentDate.getMonth()];
        },
        showForMonth(month, event) {
            this.month = this.months[month];
            
            if(event) {
                const element = event.target;
                console.log(this.previousElement)
                console.log(element)
                if(this.previousElement) {
                    this.previousElement.classList.remove('active')
                }
                this.previousElement = element;

                element.classList.add('active')
            }

            axios
            .get('http://localhost:8080/task/month/' + month)
            .then(response => {
                var data = response.data;
                this.processData(data);
            }
            ).catch(error => {
                console.warn("Couldn't access server. Using cache from local storage");
                this.product = null;
            });

        },
        showForCurrent() {
            axios
            .get('http://localhost:8080/task/all')
            .then(response => {
                var data = response.data;
                localStorage.setItem("cachedData", JSON.stringify(data));

                this.processData(data);
                
            }
            ).catch(error => {
                console.warn("Couldn't access server. Using cache from local storage");
                var data = localStorage.getItem("cachedData");

                if(data) {
                    var parsed = JSON.parse(data);
                    this.processData(parsed);
                }else {
                    this.product = "Cannot load data and no cache available!"
                }
            });
        }
      },
    mounted () {
        // Retrieve current month
        this.retrieveCurrentMonth();

        this.showForCurrent();
      }
})
