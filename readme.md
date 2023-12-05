# Uimhreacha
Converts digits (1001) into Irish words (míle a haon) based on Córas na mBunuimhreacha in An Caighdeán Oifgiúil 2017.

I made this for the Gaois 2023 Féile Haiceála, and you can see it in use on the webapp I made [here](https://uimhreacha.vercel.app).

Let me know if you have any issues with it, questions, or if there are any bugs.

# Guide
The main functionality of this is in the function `irishForNumber(n: number): string`. You can call it with any number (I've only tested properly up to about 1,000,000, but in theory it supports up to about a heptillion) and it will return an uncapitalised string in the plain form of the number (not the counting form or the personal form etc.).
