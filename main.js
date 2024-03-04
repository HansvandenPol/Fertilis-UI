const app = Vue.createApp({
    data() {
        return {
            product: [],
            image: './assets/images/socks_blue.jpg',
            inStock: true,
            details: ['50% cotton', '30% wool', '20% polyester']
        }
    },
    mounted () {
        axios
          .get('http://localhost:8080/task/all')
          .then(response => {
            var data = response.data;
            console.log(data);
            // data.forEach(i => {
            //     if(!this.product.hasOwnProperty(i.category)) {
            //         this.product[i.category] = [];
            //         this.product[i.category].push(i);
            //     } else {
            //         this.product[i.category].push(i);
            //     }
            // });

             data.forEach(i => {
                var searchItem = this.product.find(x => x.category === i.category);
                if(!searchItem){
                    this.product.push({category: i.category, data: [i]})
                } else {
                    searchItem.data.push(i);
                }
            });
            console.log(this.product);
            
        }
          )
      }
})
