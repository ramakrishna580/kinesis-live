import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { interval } from 'rxjs';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('secretAccessKey') secretAccessKey: ElementRef;
  @ViewChild('streamName') streamName: ElementRef;
  @ViewChild('accessKey') accessKey: ElementRef;
  @ViewChild('region') region: ElementRef;

  public isLoadingData: boolean;
  public someError: boolean;
  public someErrorMessage: String;
  public sampleRecord: String;
  public samplePolicy: String;

  public loadingSub;

  public streamingData: String;

  constructor(private homeService: HomeService) {
    this.isLoadingData = false;
    this.someError = false;
   }

  ngOnInit() {
    this.generateCodeSnippets();
  }

  public startStream() {
    const secretAccessKey = this.secretAccessKey.nativeElement.value;
    const streamName = this.streamName.nativeElement.value;
    const accessKey = this.accessKey.nativeElement.value;
    const region = this.region.nativeElement.value;

    if(secretAccessKey === "" || streamName === "" || accessKey === "" || region === "") {
      this.someErrorMessage = "Please enter in all the fields.";
      this.someError = true;
      return;
    }

    this.loadingSub = interval(1000).subscribe(x => {
      this.homeService.streamData(region, secretAccessKey, accessKey, streamName)
      .subscribe( payload => {
        this.isLoadingData = true;
        this.streamingData = payload;
    }, error => {
        this.isLoadingData = false;
        this.someError = true;
        this.someErrorMessage = error;
        if(this.someErrorMessage == 'NetworkingError: Network Failure') {
          this.someErrorMessage = 'NetworkingError: Stream name and region combination is invalid.'
        }
        this.loadingSub.unsubscribe();
    });
  });
  }

  public stopStream() {
    this.loadingSub.unsubscribe();
    this.isLoadingData = false;
  }

  public generateCodeSnippets() {
    this.sampleRecord = '{\n'+
                          '   "items": [\n' +
                            '      "soda",\n      "specialty chocolate",\n      "dental care"\n   ],\n' +
                          '   "order_id": "dc2d7929-d80a-4c57-8303-29dae371b9a9",\n' +
                          '   "total_cost": 128.74\n' +
                        '}';
    this.samplePolicy = '{\n'+
                        '   "Version": "2012-10-17",\n'+
                        '   "Statement": [\n' +
                        '      {\n' +
                                '         "Sid": "VisualEditor0",\n' +
                                '         "Effect": "Allow",\n' +
                                '         "Action": "kinesis:PutRecord",\n' +
                                '         "Resource": "arn:aws:kinesis:<REGION>:<ACCOUNT_ID>:stream/<STREAM_NAME>"\n' +
                        '      }\n' +
                      '   ]\n' +
                    '}\n'
  }

}
