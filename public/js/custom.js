var feed = new Instafeed({
    get: 'popular',
    tagName: 'awesome',
    clientId: '8652857289.272ee66.9b53c582e3e24f85b939d1b1c37c71d3',
    template: '<a class="animation" href="{{link}}"><img src="{{image}}" /></a>'
});
feed.run();
