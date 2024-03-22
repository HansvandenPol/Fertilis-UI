const app = Vue.createApp({
    data() {
        return {
            months: ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augstus","September","Oktober","November","December"],
            product: [],
            image: './assets/images/socks_blue.jpg',
            inStock: true,
            details: ['50% cotton', '30% wool', '20% polyester'],
            month: '',
            previousElement: null,
            quickWeatherRainfall: '',
            quickWeatherWindDirection: '',
            quickWeatherAmbientMax: '',
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
        },
        fetchQuickWeatherInfo() {
            axios
            .get('http://localhost:8080/weather/knmi/quick')
            .then(response => {
                const data = response.data;
                const statistics = data.statistics;

                statistics.forEach( i => {
                    if(i.name === "dd") {
                        const statisticData = i.data;
                        statisticData.forEach(j => {
                            if(j.stationIndex == 32) {
                                this.quickWeatherWindDirection = j.value;
                            }
                        });
                    }
                    else if(i.name === "R1H") {
                        const statisticData = i.data;
                        statisticData.forEach(j => {
                            if(j.stationIndex == 32) {
                                this.quickWeatherRainfall = j.value;
                            }
                        }); 
                    }
                    else if(i.name === "tx") {
                        const statisticData = i.data;
                        statisticData.forEach(j => {
                            if(j.stationIndex == 32) {
                                this.quickWeatherAmbientMax = j.value;
                            }
                        }); 
                    }
                });
            }
            ).catch(error => {
                console.warn("Couldn't access server.");
            });
        }
      },
    mounted () {
        // Retrieve current month
        this.retrieveCurrentMonth();

        this.showForCurrent();

        this.fetchQuickWeatherInfo();
      }
})
