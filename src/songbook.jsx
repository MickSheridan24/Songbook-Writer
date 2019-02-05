import React, { Component } from "react";
import "./App.css";
import FlexBox from "flexbox-react";
import PdfComponent from "./pdfComponent";

export default class SongBook extends Component {
  constructor(props) {
    super(props);

    //  this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.state = {
      song: {
        inText: "",
        outText: [""],
        fontS: 20,
        transpose: 0,
        title: "",
        author: ""
      },
      rightContent: "pdf",
      pdf: <PdfComponent text="Constructor Text " mutate={false} />,
      book: ["RETRIEVE"],
      retrieve: "none"
    };
    this.handleChange = this.handleChange.bind(this);
    this.Submit = this.Submit.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.store = this.store.bind(this);
    this.retrieve = this.retrieve.bind(this);
    this.switchRightContent = this.switchRightContent.bind(this);
    this.download = this.download.bind(this);
  }

  store(event) {
    let book = this.state.book;
    let title = this.state.song.title;
    let nSong = 0;
    for (let x = 1; x < book.length; x++) {
      //  console.log("THIS TITLE" + title);
      //  console.log("CHecking: " + book[x].title);
      if (book[x].song.title === title) {
        nSong = x;
      }
    }
    let copy = { song: this.state.song, pdf: this.state.pdf };

    nSong === 0 ? book.push(copy) : (book[nSong] = copy);
    this.setState({ book });
    event.preventDefault();
  }
  retrieve(event) {
    let b = this.state.book[event.target.value];
    //  console.log("RETRIEVING");
    //  console.log(b);
    //////console.log("RETRIEVING" + b);
    ////console.log(b.song);
    ////console.log(b.pdf);

    //this.setState({ song: b.song, pdf: b.pdf });

    let inText = b.song.inText;
    let title = b.song.title
      ? b.song.title
      : this.determineTitles(inText).title;
    let auth = b.song.author
      ? b.song.author
      : this.determineTitles(inText).auth;
    inText = this.determineTitles(inText).inText;
    ////console.log("TEXT " + inText);
    const outText = this.createOutput(inText);
    const transpose = b.song.transpose;
    let pdf = null;
    if (b.pdf) {
      pdf = this.updatePDF(this.state.pdf, b.pdf);
    } else {
      let transpose = 0; // FIX
      const outText = this.createOutput(inText, transpose);

      const outTextpd = this.getPDFOutput(outText);
      const length = this.adjustedFont(outText);
      const lines = outText.length;
      //  //////console.log(transpose);
      // const newSize = this.adjustedFont(outText);
      pdf = this.updatePDF(
        this.state.pdf,
        <PdfComponent
          text={outTextpd}
          mutate={true}
          lineLength={length}
          lines={lines}
          divText={outText}
          title={title}
          author={auth}
        />
      );
    }

    //alert(inText);
    this.setState({
      song: {
        inText: inText,
        title: title,
        author: auth,
        outText: outText,
        transpose: transpose
      },
      pdf: pdf
    });

    event.preventDefault();
  }
  download(event) {
    let str = "$";
    if (this.state.book.length > 1) {
      for (let x = 1; x < this.state.book.length; x++) {
        str += this.state.book[x].song.title + "]";
        str += this.state.book[x].song.author + "]";
        str += this.state.book[x].song.inText + "]";
      }
    }

    str += "$";
    console.log(str);

    var element = document.createElement("a");
    //var file = str;
    /*new Blob([document.getElementById(str)], {
      type: "text/plain"
    });*/
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(str)
    );
    element.setAttribute("download", "Songbook");

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    event.preventDefault();
  }
  readBook(str) {
    str = str.substr(1);
    let book = ["Retrieve"];
    let x = 0;
    while (str[x] !== "$" && x < str.length) {
      let title = "";
      while (str[x] !== "]") {
        title += str[x];
        x++;
      }
      x++;
      let auth = "";
      while (str[x] !== "]") {
        auth += str[x];
        x++;
      }
      x++;
      let text = "";
      while (str[x] !== "]") {
        text += str[x];
        x++;
      }

      book.push({
        song: { title: title, author: auth, inText: text, transpose: 0 }
      });

      x++;
    }

    return book;
  }
  readChords(text, trans) {
    let lines = [];
    ////console.log(trans);
    for (let x = 0; x < text.length; x++) {
      let a = x * 2;
      let b = x * 2 + 1;

      lines[a] = "";
      lines[b] = "";
      let c = false;
      let cc = 0;
      for (let y = 0; y < text[x].length; y++) {
        if (!c) {
          if (text[x][y] === "<") {
            c = true;
          } else {
            if (cc <= 0) {
              lines[a] += " ";
            } else cc--;
            lines[b] += text[x][y];
          }
        } else {
          if (text[x][y] === ">") {
            c = false;
          } else {
            if (trans > 0) {
              let h = text[x][y + 1] === "#";
              lines[a] += this.transpose(text[x][y], h, trans);
            } else {
              lines[a] += text[x][y];
            }
            cc++;
          }
        }
      }
    }
    return lines;

    //return newLines;
  }

  createOutput(text, trans) {
    let lines = [""];
    let i = 0;
    //[Title] [Artist]

    for (let x = 0; x < text.length; x++) {
      if (text[x] !== "/") {
        lines[i] += text[x];
      } else {
        // ////console.log(lines[i]);
        i++;
        lines.push("");
      }
    }
    lines = this.readChords(lines, trans);

    return lines;
  }

  adjustedFont(lines) {
    let outText = lines;
    let max = outText[0].length;
    // ////console.log(max);

    for (let y = 1; y < outText.length; y++) {
      if (outText[y].length > max) max = outText[y].length;
      //   ////console.log(max);
    }

    let h = 20;
    // ////console.log("MAX: " + max);
    while (h > 10) {
      if (h * max > 800) {
        h--;
      } else break;
    }
    //  ////console.log(h);
    return h;
  }

  getDivOutput() {
    const outText = this.state.song.outText;
    let outDiv = [];
    for (let x = 0; x < outText.length; x++) {
      if (x === 0) {
        outDiv.push(
          <div style={{ marginInlineStart: 50, marginTop: 75 }}>
            {outText[x]}
          </div>
        );
      } else if (x % 2 === 0) {
        outDiv.push(
          <div style={{ marginInlineStart: 50, marginTop: 10 }}>
            {outText[x]}
          </div>
        );
      } else {
        outDiv.push(<div style={{ marginInlineStart: 50 }}>{outText[x]}</div>);
      }
    }

    return <div>{outDiv}</div>;
  }
  getPDFOutput(text) {
    let out = "";
    const outText = text;
    for (let x = 0; x < outText.length; x++) {
      out += outText[x] + "\n";
    }
    // ////console.log(out);
    return out;
  }

  transpose(chord, plus, num) {
    if (num === 0) {
      return chord;
    } else {
      const changeable = ["A", "B", "C", "D", "E", "F", "G", "#"];
      if (!changeable.includes(chord)) {
        return chord;
      } else {
        if (chord === "#") {
          return "";
        } else {
          let sharp = plus;
          let out = chord;
          if (sharp) out += "#";
          const chords = [
            "A",
            "A#",
            "B",
            "C",
            "C#",
            "D",
            "D#",
            "E",
            "F",
            "F#",
            "G",
            "G#"
          ];
          let i = chords.indexOf(out);
          i += num;
          if (i >= 12) {
            i -= 12;
            i += null;
          }
          return chords[i];
        }
      }
    }
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleClick(event) {
    ////console.log("TRANSPOSING");
    const inText = this.state.song.inText;

    let trans = this.state.song.transpose;
    trans++;
    if (trans >= 12) {
      trans = 0;
    }
    const outText = this.createOutput(inText, trans);
    const outTextpd = this.getPDFOutput(outText);
    const pdf = this.updatePDF(
      this.state.pdf,
      <PdfComponent text={outTextpd} divText={outText} />
    );

    // ////console.log(trans);
    this.setState({
      song: {
        inText: inText,
        outText: outText,

        transpose: trans
      },
      pdf: pdf
    });
    event.preventDefault();
  }
  determineTitles(inText) {
    let title = "";
    let auth = "";
    let s = 0;
    if (inText[0] === "[") {
      s++;
      for (let x = 1; x < inText.length; x++) {
        if (inText[x] === "]") {
          s++;
          if (inText[x + 1] === "[") {
            s++;
            for (let y = x + 2; y < inText.length; y++) {
              if (inText[y] === "]") {
                s++;
                break;
              } else {
                auth += inText[y];
                s++;
              }
            }
          }
          break;
        } else {
          s++;
          title += inText[x];
        }
      }
      inText = inText.substr(s);
    }
    return { title, auth, inText };
  }
  Submit(event) {
    // alert("A song was submitted: " + this.state.value);
    let inText = this.state.value;
    //alert(inText);
    if (inText[0] === "$") {
      let book = this.readBook(inText);
      this.setState({ book });
    } else {
      let title = this.determineTitles(inText).title;

      console.log("TITLE: " + title);

      let auth = this.determineTitles(inText).auth;
      console.log("AUTHOR " + auth);
      inText = this.determineTitles(inText).inText;
      const transpose = this.state.song.transpose;
      const outText = this.createOutput(inText, transpose);

      const outTextpd = this.getPDFOutput(outText);
      const length = this.adjustedFont(outText);
      const lines = outText.length;
      //  //////console.log(transpose);
      // const newSize = this.adjustedFont(outText);
      const pdf = this.updatePDF(
        this.state.pdf,
        <PdfComponent
          text={outTextpd}
          mutate={true}
          lineLength={length}
          lines={lines}
          divText={outText}
          title={title}
          author={auth}
        />
      );

      // this.makePDF("");
      this.setState({
        song: {
          inText: inText,
          outText: outText,
          title: title,
          author: auth,
          transpose: transpose
        },
        rightContent: "pdf",
        pdf: pdf
      });
    }

    event.preventDefault();
  }
  updatePDF(oldP, curP) {
    const cur = curP.props;
    // //////console.log(" CUR: ");
    // //////console.log(cur);
    const old = oldP.props;
    // //////console.log("OLD");
    // //////console.log(old);

    const text = cur.text ? cur.text : old.text;
    const lineLength = cur.lineLength ? cur.lineLength : old.lineLength;
    const lines = cur.lines ? cur.lines : old.lines;
    const divText = cur.divText ? cur.divText : old.divText;
    const title = cur.title ? cur.title : old.title;
    const author = cur.author ? cur.author : old.author;

    return (
      <PdfComponent
        text={text}
        mutate={true}
        lineLength={lineLength}
        lines={lines}
        divText={divText}
        title={title}
        author={author}
      />
    );
  }
  getRightContent() {
    ////////console.log("RIGHT: " + this.state.rightContent);
    // //////console.log(this.state.song.inText);
    const r = this.state.rightContent;
    if (r === "none") {
      return <div>Song Will Go Here</div>;
    } else if (r === "input") {
      return <div className="Input">{this.state.song.inText}</div>;
    } else if (r === "output") {
      return this.getDivOutput();
    } else if (r === "pdf") {
      let p = this.state.pdf;
      //////console.log(p);
      return p;
    }
  }
  switchRightContent(event) {
    let r = this.state.rightContent;

    switch (r) {
      case "input":
        r = "output";
        break;
      case "output":
        r = "pdf";
        break;
      case "pdf":
        r = "input";
        break;
      default:
        r = "input";
    }

    this.setState({ rightContent: r });
    event.preventDefault();
  }
  getSelects() {
    let out = [];
    // console.log("THIS EXISTS");
    for (let x = 1; x < this.state.book.length; x++) {
      console.log("TITLE" + this.state.book[x].song.title);
      out.push(<option value={x}>{this.state.book[x].song.title}</option>);
    }
    return out;
  }

  render() {
    return (
      <div>
        <FlexBox className="Flex-Window" flexDirection="row">
          <FlexBox flexDirection="row" className="Left-Box" flex="1">
            <FlexBox flex="1" />
            <FlexBox flex="2" flexDirection="column">
              <h1
                style={{ marginInlineStart: 100, marginTop: 50 }}
                aligncontent="center"
              >
                SongBook!
              </h1>
              <form onSubmit={this.handleSubmit} aligncontent="center">
                <textarea
                  style={{ width: 400, fontSize: 12 }}
                  rows="30"
                  onChange={this.handleChange}
                  defaultValue={this.state.song.inText}
                />
                <br />

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={this.Submit}
                  style={{ marginInlineStart: 25 }}
                >
                  Submit
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={this.store}
                >
                  Store
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={this.handleClick}
                >
                  Transpose {this.state.song.transpose}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={this.switchRightContent}
                >
                  View: {this.state.rightContent}
                </button>
                <br />
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginInlineStart: 25 }}
                  onClick={this.download}
                >
                  Save
                </button>
                <select
                  className="btn btn-secondary btn-sm"
                  value={0}
                  onChange={this.retrieve}
                  style={{ marginInlineStart: 25 }}
                >
                  <option value="RETRIEVE">Retrieve</option>
                  {this.getSelects()}
                </select>
              </form>
            </FlexBox>
            <FlexBox flex="1" />
          </FlexBox>

          <FlexBox className="Right-Box" flex="1">
            <div style={{ marginInlineStart: 100, marginTop: 50 }}>
              {this.getRightContent()}
            </div>
          </FlexBox>
        </FlexBox>
      </div>
    );
  }
}
//
