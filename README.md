<h1 align="center">Animo-bot</h1>

<div align="center">
<img src="./src/assets/bot_pic.png" width="100"/>
</div>

## Table of Contents
- [Overview](#overview)
- [Built With](#built-with)
- [Commands](#Commands)
- [How to use](#how-to-use)

## Overview

![screenshot](./src/assets/overview.jpg)

### Built With

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api/)
- [express](https://expressjs.com/)
- [mongodb](https://mongoosejs.com/docs)

## Commands

### Simple commands

<code>/topupcoming</code> - Top upcoming on MyAnimeList <br/>
<code>/topairing</code> - Top tv on MyAnimeList <br/>
<code>/topmovie</code> - Top movie on MyAnimeList <br/>
<code>/toptv</code> - Top tv on MyAnimeList <br/>
<code>/topova</code> - Top ova on MyAnimeList  <br/>
<code>/topspecial</code> - Top special on MyAnimeList <br/>
<code>/favorites</code> - The list of your all favorite<br/>
<code>/empty_favorites</code> - Empty the list of favorites <br/>
<code>/help</code> - The list of all commands<br/>
<code>/stop</code> - delete your data from the animo server<br/>

### Advanced commands
<code>/search</code> + <code>N</code> - Search an anime on MyAnimeList<br/>
<code>/topupcoming</code> + <code>X</code> - Top upcoming on MyAnimeList <br/>
<code>/topairing</code> + <code>X</code> - Top tv on MyAnimeList <br/>
<code>/topmovie</code> + <code>X</code> - Top movie on MyAnimeList <br/>
<code>/toptv</code> + <code>X</code> - Top tv on MyAnimeList <br/>
<code>/topova</code> + <code>X</code> - Top ova on MyAnimeList  <br/>
<code>/topspecial</code> + <code>X</code> - Top special on MyAnimeList <br/>

#### <code>X</code> : the number of results

#### <code>N</code> : anime name to search

## How To Use
To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git https://github.com/charo164/animo-bot.git

# Install dependencies
$ npm install

# Run the app
$ npm start
```