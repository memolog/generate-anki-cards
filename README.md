## Description

Genarating a import file for [Anki](https://ankiweb.net)

The main purpose of this CLI tool is generating English words list to memorize with Anki. The script can parse csv or json file, like the following format

## Usage

```bash
node ./js/bin.js -o ../out -i ../out/data.csv
```

## Format

csv

```csv
apple,リンゴ
```

- CVS row parser automatically try to find image and sound files from desinated websites (Cambridge dictionary, unsplash or Google translate) if the first column is English (all charactors are in ascii code).

json

```json
[
  {
    "frontText": "リンゴ",
    "backText": "apple",
    "backImage": {
      "name": "apple",
      "searchWord": "apple"
    },
    "backSound": {
      "name": "apple",
      "searchWord": "apple"
    }
  }
]
```

- This json sample is same as the above csv sample

### Outupt

The generated data is like the following.

```
apple;リンゴ;<img src="apple.jpg">;;;;;[sound:apple.mp3];ˈæp.əl;;Image from <a href="https://dictionary.cambridge.org/dictionary/english/apple">Cambridge Dictionary</a><br>Sound from <a href="https://dictionary.cambridge.org/dictionary/english/apple">Cambridge Dictionary</a>
```

### Card Fields

The data is assumed the card has the following fields

1. backText
2. frontText
3. frontImage
4. frontSound
5. frontSoundIPA
6. frontAppendix
7. backImage
8. backSound
9. backSoundIPA
10. backAppendix
11. copyright

![](https://user-images.githubusercontent.com/494278/50670442-040c9c80-100f-11e9-919c-d14dbecfcadd.png)

### Sample Card Type

Front Template

```
{{FrontText}}
{{#FrontImage}}<div class="image">{{FrontImage}}</div>{{/FrontImage}}
{{#FrontSound}}{{FrontSound}}{{/FrontSound}}
```

Card Style

```
.card {
 font-family: Yukyokasho, serif;
 font-size: 60px;
 text-align: center;
 color: black;
 background-color: white;
}

img {
 height: 270px;
}

.description {
  font-size: 40px;
}

.pron {
   color: darkblue;
   font-size: 30px;
   font-family: Arial,Helvetica,sans-serif;
}

.copyright {
  margin: 20px 0;
  font-size: 14px;
}

.appendix {
  font-size: 20px;
}
```

Back Template

```
{{FrontSide}}

<hr id=answer>

{{BackText}}{{#BackSoundIPA}} <span class="pron">/{{BackSoundIPA}}/</span>{{/BackSoundIPA}}
{{#BackAppendix}}<div class="appendix">{{BackAppendix}}</div>{{/BackAppendix}}
<div class="copyright">
{{Copyright}}
</div>
{{BackSound}}
```

![](https://user-images.githubusercontent.com/494278/50670441-03740600-100f-11e9-941f-33822891cea8.png)

![anki-sample](https://user-images.githubusercontent.com/494278/50671484-8d26d200-1015-11e9-82ee-92657968c9af.gif)
