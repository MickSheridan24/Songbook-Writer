import React, { Component } from "react";
import jsPDF from "jspdf";
import "./App.css";

class PdfComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
      doc: new jsPDF(),
      out: <div />,
      changing: false,
      lines: 0,
      divText: "",
      formatted: false,
      title: this.props.title ? this.props.title : "SONG",
      author: this.props.author ? this.props.author : "ARTIST"
    };
  }
  componentDidMount() {
    if (!this.state.formatted) {
      let doc = this.state.doc;
      doc.setFont("courier");
      ////console.log("DOC: ");
      ////console.log(doc);

      this.formatTitle(doc);

      //doc.save("./Test.pdf");

      doc = this.checkPageLength();
      //console.log("MOUNTING");
      //console.log(doc);
      doc.text(this.props.text, 10, 45);

      const uri = doc.output("bloburi");
      const out = (
        <iframe
          class="iframe"
          name="song"
          height={"700em"}
          width={"500em"}
          title="PDF"
          frameBorder="0"
          align="middle"
          src={uri}
        />
      );

      this.setState({
        doc,
        out
      });
    }
  }
  formatTitle(doc) {
    // ////console.log("TITLE " + this.state.title);
    // ////console.log("AUTHOR: " + this.state.author);
    doc.setProperties({
      title: this.state.title
    });
    doc.setFont("courier");
    doc.setFontSize(this.props.lineLength + 4);
    doc.text(
      this.state.title ? this.state.title : "New Song",
      100,
      15,
      "center"
    );
    doc.setFontSize(this.props.lineLength + 2);
    doc.text(
      this.state.author ? this.state.author : "Unknown Artist",
      100,
      25,
      "center"
    );
    return doc;
  }

  checkPageLength() {
    // ////console.log("THIS WILL UPDATE");
    let doc = this.state.doc;

    let h = this.checkLength(this.state.lines, this.props.lineLength, false);
    //////console.log("LINE OVERFLOW: " + h);
    let b = h > 0;
    let l = 0;
    let maxLines = this.state.lines;
    let p1Lines = maxLines - h;
    if (b) {
      doc = new jsPDF();
      this.formatTitle(doc);

      doc.setFont("courier");
      doc.setFontSize(this.props.lineLength);
      doc.setProperties({
        title: "Song"
      });

      doc.text(10, 45, this.getDivSubsection(l, p1Lines));
      doc.addPage();
    }

    while (h > 0) {
      h = this.checkLength(h, this.props.lineLength, true);
      l = p1Lines;
      p1Lines = maxLines - h;

      doc.text(10, 10, this.getDivSubsection(l, p1Lines));
      if (h > 0) {
        doc.addPage();
      }
    }
    return doc;
  }

  componentDidUpdate() {
    //   ////console.log("did update");
    //////console.log(this.props.divText);
    if (this.state.changing) {
      // ////console.log("loading");
      this.forceUpdate();
    }
    if (!this.state.formatted) {
      let doc = this.checkPageLength();
      this.setState({
        formatted: true,
        doc: doc
      });
    }
  }
  getDivSubsection(s, e) {
    let out = "";
    const outText = this.props.divText;

    for (let x = s; x < e; x++) {
      out += outText[x] + "\n";
    }

    // ////console.log(out);
    return out;
  }

  checkLength(lines, size, bool) {
    let n = lines * size;
    let h = 0;
    let m = 650;
    if (!bool) m = 550;
    while (n > m) {
      h++;
      n -= size;
    }
    return h;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let load = <div> Changing... </div>;
    let doc = prevState.doc;

    const uri = doc.output("bloburi");

    if (nextProps.mutate === true) {
      if (nextProps.text !== prevState.text) {
        // ////console.log("Changin them Props");
        doc = new jsPDF();
        doc.setFont("courier");
        doc.setFontSize(nextProps.lineLength + 4);
        doc.setProperties({
          title: nextProps.title
        });
        doc.text(
          nextProps.title ? nextProps.title : "New Song",
          100,
          15,
          "center"
        );
        doc.setFontSize(nextProps.lineLength + 2);
        doc.text(
          nextProps.author ? nextProps.author : "Unknown Artist",
          100,
          25,
          "center"
        );
        doc.setFontSize(nextProps.lineLength);
        doc.text(nextProps.text, 10, 45);
        // /  doc.text(nextProps.text, 10, 10);
        return {
          text: nextProps.text,
          out: load,
          changing: true,
          doc: doc,
          lines: nextProps.lines,
          divText: nextProps.divText,
          formatted: false,
          title: nextProps.title,
          author: nextProps.author
        };
      } else {
        // ////console.log("Props have been changed");
        return {
          out: (
            <iframe
              class="iframe"
              name="song"
              title="PDF"
              frameBorder="0"
              align="middle"
              src={uri}
            />
          ),
          changing: false
        };
      }
    } else {
      //////console.log("Fancier Receiver is unneccessary");
      return null;
    }
  }

  render() {
    return <div> {this.state.out} </div>;
  }
}

export default PdfComponent;
