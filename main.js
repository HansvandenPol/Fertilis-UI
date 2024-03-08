const app = Vue.createApp({
    data() {
        return {
            product: [],
            image: './assets/images/socks_blue.jpg',
            inStock: true,
            details: ['50% cotton', '30% wool', '20% polyester']
        }
    },
    methods: {
        processData(data) {
            console.log(data);
            data.forEach(i => {
                var searchItem = this.product.find(x => x.category === i.category);
                if(!searchItem){
                    this.product.push({category: i.category, data: [i]})
                } else {
                    searchItem.data.push(i);
                }
            });
        }
      },
    mounted () {
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
            //console.log("A: " + data);
          //  console.log("B: " + JSON.parse(data)[0].name);
            var parsed = JSON.parse(data);
            this.processData(parsed);
          });
      }
})
