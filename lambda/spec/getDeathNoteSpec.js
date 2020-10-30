'use strict';

const statusUtil = require('../src/statusUtil');

describe('getDeathNote', function() {

const expectedNeglect = `Here lies Sharpie Sharp; Its life you took into your \
hands; Agreeing to meet their every demand. But slack off, you did, it's plain \
to see, And today we learned that even virtual cacti have needs.You let Sharpie \
Sharp's heath score drop to 0. `;

const expectedDehydration = `Here lies Sharpie Sharp; Its life you took into \
your hands; Agreeing to meet their every demand. But inattentive, you were; \
there was one task you didn't bother; and today we learned that even virtual \
cacti need water. You forgot to water Sharpie Sharp. They've perished from \
dehydration. `;    

const expectedDrowning = `Here lies Sharpie Sharp; \
Its life you took into your hands; \
Agreeing to meet their every demand. \
But overenthusiastic, you were; though your intentions were sound; \
Today we learned at even virtual cacti can drown. \
You over-watered Sharpie Sharp. They've died from drowning. `;    

    it('should be a neglect note', function(){
        
        const deathNote = statusUtil.getDeathNote('Sharpie Sharp', 'neglect');
        console.log(deathNote);
        console.log(expectedNeglect);
        expect(deathNote).toBe(expectedNeglect);
    });

    it('should be a dehydration note', function(){
        const deathNote = statusUtil.getDeathNote('Sharpie Sharp', 'dehydration');
        expect(deathNote).toBe(expectedDehydration);
    });

    it('should be a drowning note', function(){
        const deathNote = statusUtil.getDeathNote('Sharpie Sharp','drowning');
        expect(deathNote).toBe(expectedDrowning);
    });    
});