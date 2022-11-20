// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved

// noinspection ES6PreferShortImport
import {MethodCallExpression} from '@themost/query';

export declare class MathMethodParser {
    static round(args: any[]): MethodCallExpression;
    static ceil(args: any[]): MethodCallExpression;
    static floor(args: any[]): MethodCallExpression;
    static min(args: any[]): MethodCallExpression;
    static max(args: any[]): MethodCallExpression;
    static mean(args: any[]): MethodCallExpression;
}
