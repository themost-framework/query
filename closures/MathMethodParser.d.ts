// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved

// noinspection ES6PreferShortImport
import {MethodCallExpression} from '../expressions';

export declare class MathMethodParser {
    static round(args: any[]): MethodCallExpression;
    static ceil(args: any[]): MethodCallExpression;
    static floor(args: any[]): MethodCallExpression;
    static min(args: any[]): MethodCallExpression;
    static max(args: any[]): MethodCallExpression;
    static mean(args: any[]): MethodCallExpression;
}
