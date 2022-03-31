// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

// noinspection ES6PreferShortImport
import {MethodCallExpression} from '../expressions';

export declare class StringMethodParser {
    startsWith(args: any[]): MethodCallExpression;
    endsWith(args: any[]): MethodCallExpression;
    toLowerCase(args: any[]): MethodCallExpression;
    toLocaleLowerCase(args: any[]): MethodCallExpression;
    toUpperCase(args: any[]): MethodCallExpression;
    toLocaleUpperCase(args: any[]): MethodCallExpression;
    indexOf(args: any[]): MethodCallExpression;
    substr(args: any[]): MethodCallExpression;
    substring(args: any[]): MethodCallExpression;
    trim(args: any[]): MethodCallExpression;
    concat(args: any[]): MethodCallExpression;
    includes(args: any[]): MethodCallExpression;
}
