# [language-ansi-styles](https://atom.io/packages/language-ansi-styles)

Converts ANSI escape sequences into formatted text like in your terminal/shell.

![Demo](https://raw.githubusercontent.com/lloiser/language-ansi-styles/master/assets/sample.png)

Even basic images are possible:

![Smiley](https://raw.githubusercontent.com/lloiser/language-ansi-styles/master/assets/smiley.png)

# Options

* _Hide escape sequences_: hides all escape sequences and only keep the bare text with styles and color applied to it. <br /> __NOTE:__ Hiding characters in atom causes the editor to behave weirdly. The selection and cursor position is totally screwed and makes it pretty hard navigate within or select any text.

# Caveats

* the escape code for inverse `7` is currently not supported

* escape codes `38;2;r;g;b` and `48;2;r;g;b` are not supported

With these escape codes you can specify any rgb color (each color ranging from 0-255). Due to the nature of a grammar in atom it is not possible to create styles on demand as they occur. I could (in theory) create >16 million styles to capture every possible rgb color, but I doubt atom feels well afterwards...

* atom wraps after 500 characters, period.

atom v1.15.0 introduced a hard limit after how many characters a line automatically wraps to a line. This is actually not a big deal for a typical user. But keep it in mind before opening an issue.

* No themes at the moment

There is currently no possibility to define/select themes. For now you can override the colors in your own atom stylesheet.
