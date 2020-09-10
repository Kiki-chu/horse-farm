class Basket {
    constructor(shopperId) {
        this.shopperId = shopperId;
        this.items = [];
    }
    addItemToBasket(item) {
        const currentItem = this.items.find((currentItem) => currentItem.sku === item.sku)
        if (currentItem) {
            currentItem.qty ++;
        } else {
            this.items.push( {
                sku: item.sku,
                name: item.name,
                price: item.price,
                qty: 1
            })
        }
    }
}

module.exports = Basket;