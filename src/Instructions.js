import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Grid,
  Header,
  Image,
  List,
} from 'semantic-ui-react';

import './css/dswallau.css';
import './css/instructions.css';

export default class Instructions extends Component {

  render() {
    return (
      <Container className='instructions-container'>
        <Header
          as='h1'
          content='Instructions' 
          textAlign='center'
          className='dswallau instructions-header' />
        <List ordered>
          <List.Item className='install-metamask-item'>
            <p>To purchase SIN tokens, please install Metamask. Metamask is a Chrome extension that lets you use Ethereum from your browser.</p>
            <Grid columns={2} >
              <Grid.Column width={5}>
                <Image
                  size='tiny'
                  className='center-hack'
                  src="/images/metamask.png" />
              </Grid.Column>
              <Grid.Column width={11}>
                <Grid.Row className='get-metamask-row'>
                  <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn">
                    <Button className='get-metamask-button'>Get Metamask Chrome Extension</Button>
                  </a>
                </Grid.Row>
                <Grid.Row>
                  <a href="https://metamask.io/" className='learn-more'>Learn More</a>
                </Grid.Row>
              </Grid.Column>
            </Grid>
          </List.Item>
          <List.Item>
            <p>Follow the instructions on Metamask's website to create an account and send Ether (ETH) to it.</p>
          </List.Item>
          <List.Item>
            <p>After you confess you will be prompted to pay for your sin through Metamask. The correct address for payment will already be filled out for you.</p>
          </List.Item>
        </List>
        <div className='confess-button-wrapper'>
          <Link to="/confess">
            <Button primary size='big' className='btn-cta'>Confess</Button>
          </Link>
        </div>
      </Container>
    );
  }

}