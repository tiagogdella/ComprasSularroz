import jwt from "jsonwebtoken";
import { authenticate } from "../authenticate.js";
import { AppError } from "../../errors/AppError.js";

function makeRes() {
    return {} as any;
}

describe("authenticate middleware", () => {
    it("rejeita requisição sem header Authorization", () => {
        const req = { headers: {} } as any;
        const next = jest.fn();

        expect(() => authenticate(req, makeRes(), next)).toThrow(AppError);
        expect(next).not.toHaveBeenCalled();
    });

    it("rejeita header sem o prefixo Bearer", () => {
        const req = { headers: { authorization: "Token abc123" } } as any;
        const next = jest.fn();

        expect(() => authenticate(req, makeRes(), next)).toThrow(AppError);
        expect(next).not.toHaveBeenCalled();
    });

    it("rejeita token inválido/adulterado", () => {
        const req = { headers: { authorization: "Bearer token-invalido" } } as any;
        const next = jest.fn();

        expect(() => authenticate(req, makeRes(), next)).toThrow(AppError);
        expect(next).not.toHaveBeenCalled();
    });

    it("aceita token válido, define req.userId e chama next()", () => {
        const token = jwt.sign({ userId: 42 }, process.env.JWT_SECRET as string);
        const req = { headers: { authorization: `Bearer ${token}` } } as any;
        const next = jest.fn();

        authenticate(req, makeRes(), next);

        expect(req.userId).toBe(42);
        expect(next).toHaveBeenCalledTimes(1);
    });
});
