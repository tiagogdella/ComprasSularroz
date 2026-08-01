import { errorHandler } from "../errorHandler.js";
import { AppError } from "../../errors/AppError.js";

function makeRes() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("errorHandler", () => {
    it("trata AppError com o status e mensagem definidos por quem lançou o erro", () => {
        const res = makeRes();
        errorHandler(new AppError(404, "Supplier not found"), {} as any, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Supplier not found" });
    });

    it("trata JSON malformado no corpo da requisição como 400", () => {
        const res = makeRes();
        const err = Object.assign(new SyntaxError("Unexpected token"), { status: 400 });
        errorHandler(err, {} as any, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid JSON body" });
    });

    it("mapeia erro Prisma P2002 (registro duplicado) pra 409", () => {
        const res = makeRes();
        errorHandler({ code: "P2002" }, {} as any, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: "Resource already exists (duplicate value)" });
    });

    it("mapeia erro Prisma P2025 (não encontrado) pra 404", () => {
        const res = makeRes();
        errorHandler({ code: "P2025" }, {} as any, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Resource not found" });
    });

    it("mapeia erro Prisma P2003 (violação de FK) pra 409", () => {
        const res = makeRes();
        errorHandler({ code: "P2003" }, {} as any, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: "Operation violates a related record (foreign key constraint)" });
    });

    it("cai pra 500 genérico em erro desconhecido, sem vazar detalhes", () => {
        const res = makeRes();
        jest.spyOn(console, "error").mockImplementation(() => {});

        errorHandler(new Error("algo bem interno explodiu"), {} as any, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });

        (console.error as jest.Mock).mockRestore();
    });
});
