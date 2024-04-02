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
            quickWeatherWindSpeed: '',
            cloudIndicatorIcon: 'fa-solid fa-sun',
            cloudIndicatorColor: 'black'
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
            .get('http://localhost:8081/task/month/' + month)
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
            .get('http://localhost:8081/task/all')
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
        fetchQuickWeatherInfo(geoPosition) {
            var defaultStationName = "DE BILT AWS";
            var stationIndex = 32;

            axios
            .get('http://localhost:8081/weather/knmi/quick?lat=52.50&lon=6.09')
            .then(response => {
                const data = response.data;
                const statistics = data.statistics;

                statistics.forEach( i => {
                    if(i.name === "dd") {
                        const statisticData = i.data;
                        this.quickWeatherWindDirection = this.calculateDirectionText(statisticData[0].value);
                    }
                    else if(i.name === "R1H") {
                        const statisticData = i.data;
                        this.quickWeatherRainfall = Math.round(statisticData[0].value * 10) / 10;
                    }
                    else if(i.name === "tx") {
                        const statisticData = i.data;
                        this.quickWeatherAmbientMax = statisticData[0].value;
                    }
                    else if(i.name === "Sav1H") {
                        const statisticData = i.data;
                        this.quickWeatherWindSpeed = this.setWindSpeedToBeaufort(statisticData[0].value);
                    }
                    else if(i.name === "n") {
                        const statisticData = i.data;
                        this.setCloudIndicatorIcon(statisticData[0].value);
                    }
                });
            }
            ).catch(error => {
                console.warn("Couldn't access server.");
            });

            this.setCloudIndicatorIcon();
        },
        calculateDirectionText(direction) {
            console.log(direction);
            var directionText;
            if(direction <= 11.25 || direction >= 348.75 ) {
                directionText = 'N';
            } else if(direction >= 11.25 && direction < 33.75) {
                directionText = 'NNO';
            } else if(direction >= 33.75 && direction < 56.25) {
                directionText = 'NO';
            } else if(direction >= 56.25 && direction < 78.75) {
                directionText = 'ONO';
            } else if(direction >= 78.75 && direction < 101.25) {
                directionText = 'O';
            } else if(direction >= 101.25 && direction < 123.75) {
                directionText = 'OZO';
            } else if(direction >= 123.75 && direction <  146.25) {
                directionText = 'ZO';
            } else if(direction >= 146.25 && direction < 168.75) {
                directionText = 'ZZO';
            } else if(direction >= 168.75 && direction < 191.25) {
                directionText = 'Z';
            } else if(direction >= 191.25 && direction < 213.75) {
                directionText = 'ZZW';
            } else if(direction >= 213.75 && direction < 236.25) {
                directionText = 'ZW';
            } else if(direction >= 236.25 && direction < 258.75) {
                directionText = 'WZW';
            } 
            else if(direction >= 258.75 && direction < 281.25) {
                directionText = 'W';
            } 
            else if(direction >= 281.25 && direction < 303.75) {
                directionText = 'WNW';
            } 
            else if(direction >= 303.75 && direction < 326.25) {
                directionText = 'NW';
            } 
            else if(direction >= 326.25 && direction < 348.75) {
                directionText = 'NNW';
            } 
            return directionText;
        },
        setCloudIndicatorIcon(cloudOctaValue) {
            console.log('octa value: ' + cloudOctaValue);
            
            if(cloudOctaValue < 2 && cloudOctaValue >=0) {
                this.cloudIndicatorIcon = "fa-solid fa-sun";
                this.cloudIndicatorColor = "orange";
            } else if(cloudOctaValue >= 2 && cloudOctaValue <= 4) {
                this.cloudIndicatorIcon = "fa-solid fa-cloud-sun";
                this.cloudIndicatorColor = "black";
            } else if(cloudOctaValue == 5) {
                this.cloudIndicatorIcon = "fa-solid fa-cloud";
                this.cloudIndicatorColor = "lightgray";
            } else if(cloudOctaValue == -9999.0) {
                this.cloudIndicatorIcon = "fa-solid fa-cloud-sun";
                this.cloudIndicatorColor = "black";
            }
            else {
                this.cloudIndicatorIcon = "fa-solid fa-cloud";
                this.cloudIndicatorColor = "gray"
            }
            console.log(this.cloudIndicatorColor);
        }, setWindSpeedToBeaufort(speedMs) {
            if(speedMs <= 0.2) {return 0;}
            else if(speedMs > 0.2 && speedMs <= 1.5) {return 1;}
            else if(speedMs > 1.5 && speedMs <= 3.3) {return 2;}
            else if(speedMs > 3.3 && speedMs <= 5.4) {return 3;}
            else if(speedMs > 5.4 && speedMs <= 7.9) {return 4;}
            else if(speedMs > 7.9 && speedMs <= 10.7) {return 5;}
            else if(speedMs > 10.7 && speedMs <= 13.8) {return 6;}
            else if(speedMs > 13.8 && speedMs <= 17.1) {return 7;}
            else if(speedMs > 17.1 && speedMs <= 20.7) {return 8;}
            else if(speedMs > 20.7 && speedMs <= 24.4) {return 9;}
            else if(speedMs > 28.4 && speedMs <= 28.4) {return 10;}
            else if(speedMs > 32.6 && speedMs <= 32.6) {return 11;}
            else {return 12;}
        }
      },
    mounted () {
        // Retrieve current month
        this.retrieveCurrentMonth();

        this.showForCurrent();

        // navigator.geolocation.getCurrentPosition((position) => {this.fetchQuickWeatherInfo(position);}, () => {this.fetchQuickWeatherInfo(null);});
        this.fetchQuickWeatherInfo(null);
    } 
});
