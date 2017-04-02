import React, { Component } from 'react';
import dashjs from "dashjs";
import './App.css';

function ShowMetadata(props) {
    return(
        <div className="textArea" >
          <h3>{props.metadata.title}</h3>
          <p className="paragraph" > {props.metadata.description} </p>
          <button className="button buttonArea" onClick={props.onEdit} >Update metadata</button>
        </div>
    );
}

function ShowImageAndPlayButton(props) {
    return (
        <div className="imageArea" >
          <img className="image-crop" src={props.video} alt="Nothing here."/>
          <div className="overlay">
            <figure>
              <button name="play" onClick={props.onPlay} ></button>
            </figure>
          </div>
        </div>
    );
}

class PlayVideo extends Component {
    render() {
        return (
            <div className="imageArea" >
              <video id={"video" + this.props.idKey} controls autoPlay/>
            </div>
        );
    }
    componentDidMount () {
        var url = this.props.videoLink;
        var player = dashjs.MediaPlayer().create();
        player.initialize(document.querySelector("#video" + this.props.idKey ), url, true);
    }
}

//returns null if the metadata isn't present
function MetadataInput(props) {
    if (props.value !== undefined) {
    return (
        <tr>
          <td className="tdName" >{props.label}:</td>
          <td>
            <input type="text" name={props.label} className="input" value={ props.value } onChange={ props.onChange }/><br/>
          </td>
        </tr>
    );
    }
    else return (null);
}

class UpdateMetadata extends Component {
    constructor(props){
        super(props);
        this.state = {metadata: props.metadata};
    }
    render() {
        return (
            <div className="textArea" >
              <div className="form">
                <table>
                  <tbody>
                    <MetadataInput value={ this.state.metadata.title } label="title" onChange={ this.titleChange.bind(this) } />
                    <MetadataInput value={ this.state.metadata.description } label="description" onChange={ this.desChange.bind(this) } />
                    <MetadataInput value={ this.state.metadata.genre } label="genre" onChange={ this.genreChange.bind(this) } />
                    <MetadataInput value={ this.state.metadata.tags } label="tags" onChange={ this.tagsChange.bind(this) } />
                    <MetadataInput value={ this.state.metadata.prodCountry } label="prodCountry" onChange={ this.prodChange.bind(this) } />
                    <MetadataInput value={ this.state.metadata.keywords } label="keywords" onChange={ this.keywordsChange.bind(this) } />
                  </tbody>
                </table>
              </div>
              <button className="buttonArea button buttonSmall" onClick={() => this.props.onSave(this.state.metadata)} >Save</button>
              <button className="buttonArea button buttonSmall" onClick={ this.props.onCancel } >Cancel</button>
            </div>
        )
        ;}

    titleChange(event) {
        this.setMetadata({title: event.target.value});
    }
    desChange(event) {
        this.setMetadata({description: event.target.value});
    }
    genreChange(event) {
        this.setMetadata({genre: event.target.value});
    }
    tagsChange(event) {
        this.setMetadata({tags: event.target.value});
    }
    prodChange(event) {
        this.setMetadata({prodCountry: event.target.value});
    }
    keywordsChange(event) {
        this.setMetadata({keywords: event.target.value});
    }

    setMetadata(metadata) {
        let newMetadata = {};

        for (let x in this.state.metadata)
            newMetadata[x] = this.state.metadata[x];

        for (let x in metadata)
            newMetadata[x] = metadata[x];

        this.setState({ metadata: newMetadata });
    }
}

class Asset extends Component {
    constructor(props) {
        super(props);
        let metadata = {title : props.asset.title,
                        description : props.asset.metadata["description-short"],
                        genre: props.asset.metadata.genre,
                        tags: props.asset.metadata.tags,
                        prodCountry: props.asset.metadata["production-country"],
                        keywords: props.asset.metadata.keywords};

        if (metadata.description !== undefined)
            metadata.description = metadata.description.$;
        if (metadata.genre !== undefined)
            metadata.genre = metadata.genre.$;
        if (metadata.tags !== undefined)
            metadata.tags = metadata.tags.$;
        if (metadata.prodCountry !== undefined)
            metadata.prodCountry = metadata.prodCountry.$;
        if (metadata.keywords !== undefined)
            metadata.keywords = metadata.keywords.$;
        if (metadata.parental !== undefined)
            metadata.parental = metadata.parental.$;
        let videoLink = "http://vimond-rest-api.ha.expo-first.vimondtv.com" + props.asset.playback["@uri"] + ".json?protocol=DASH";
        fetch(videoLink)
            .then(response => response.json())
            .then(json => {
                this.setState({videoLink: json.playback.items.item.url});
                console.log(json.playback.items.item.url);
            });
        this.state = { metadata: metadata, widget: <ShowMetadata metadata={ metadata } onEdit={ this.onEdit.bind(this) }/>,
                       video: <ShowImageAndPlayButton video={ props.asset.imageUrl } onPlay={ this.onPlay.bind(this) }/> };
    }
    render() {
        return (
            <div className="container" >
              {this.state.widget}
              {this.state.video}
            </div>
        );
    }

    onEdit() {
        this.setState({widget: <UpdateMetadata metadata={this.state.metadata}
                       onSave={this.onSave.bind(this)} onCancel={this.onCancel.bind(this)}/>});
    }

    onSave(props) {
        this.setState({metadata: props, widget: <ShowMetadata metadata={ props } onEdit={this.onEdit.bind(this)}/>});
    }

    onCancel() {
        this.setState({widget: <ShowMetadata metadata={this.state.metadata} onEdit={this.onEdit.bind(this)}/>});
    }

    onPlay(){
        this.setState({video: <PlayVideo idKey={this.props.idKey} videoLink={this.state.videoLink} />});
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        fetch("https://vimond-rest-api.ha.expo-first.vimondtv.com/api/web/search/categories/root/assets.json")
            .then(response => response.json())
            .then(json => {
                json.assets.asset.forEach((asset,index) => this.state.assets.push(<Asset asset={asset} key={index} idKey={index}/>));
                this.forceUpdate();
            });
        this.state = { assets: [] };
    }

    render() {
        return (
            <div className="App">
              <h2>Vimond Media Solutions Case</h2>
              <div className="App-intro">
                {this.state.assets}
              </div>
            </div>

        );
    }
}

export default App;
