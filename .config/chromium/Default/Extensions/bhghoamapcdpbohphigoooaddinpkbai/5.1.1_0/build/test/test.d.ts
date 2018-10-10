interface TestCase {
    name: string;
    data: {
        [hash: string]: {
            [key: string]: any;
        };
    };
}
declare const cases: TestCase[];
declare let testCaseIndex: number;
declare let testRes: Array<{
    pass: boolean;
    error: string;
}>;
declare let testResData: string[];
declare function testStart(): void;
declare function testFinished(): void;
declare function clear(): Promise<{}>;
declare function get<T>(): Promise<{
    [key: string]: T;
}>;
declare function set(items: {
    [key: string]: {};
}): Promise<{}>;
declare function test(): Promise<void>;
declare function showTestResult(): void;
declare const startBtn: HTMLElement | null;
