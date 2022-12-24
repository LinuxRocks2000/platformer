// Not to be confused with std::stringstream. Wraps an std::string and provides file-io like functions.
#include <string>
#include <iostream>


class StringStream{
public:
    std::string buffer;
    unsigned long position = 0;

    char _read(){
        if (isEmpty()){
            return EOF;
        }
        position ++;
        return buffer[position - 1];
    }

public:
    StringStream(){

    }

    StringStream(std::string initial){
        buffer = initial;
    }

    bool isEmpty(){
        return position >= buffer.size();
    }

    char read(){
        return _read();
    }

    char peek(){
        char ret = _read();
        position --;
        return ret;
    }

    std::string read(unsigned int length){
        std::string ret;
        for (unsigned int i = 0; i < length; i ++){
            ret += _read();
        }
        return ret;
    }

    std::string readUntil(char stopChr){
        std::string ret;
        signed char chr = _read();
        while (chr != stopChr && chr != EOF){
            ret += chr;
            chr = _read();
        }
        return ret;
    }

    void add(char chr){
        buffer += chr;
    }

    void add(std::string string){
        buffer += string;
    }

    bool reached(char chr){
        return peek() == chr;
    }

    StringStream bufferTill(char chr){
        StringStream ret(readUntil(chr));
        return ret;
    }

    void skipWhitespace(){
        while (true){
            char val = read();
            if (val != ' ' && val != '\n'){
                break;
            }
        }
        position --;
    }

    std::string readRemaining(){
        return read(buffer.size() - position);
    }

    std::string getBuffer(){
        return buffer;
    }

    std::string convert_string(std::basic_string<signed char> old){
        std::string ret = "";
        for (signed char x : old){
            ret += (char)x - 127;
        }
        return ret;
    }

    std::string readUntil(std::basic_string<signed char> match){
        std::basic_string<signed char> buf;
        std::basic_string<signed char> res;
        while (true){
            buf += read();
            if (buf[buf.size() - 1] == EOF){
                break;
            }
            if (buf.size() < match.size()){
                continue;
            }
            if (buf == match){
                break;
            }
            else{
                res += buf[0];
                buf.erase(0, 1);
            }
        }
        return convert_string(res);
    }

    void erase(unsigned long start, unsigned long end){
        buffer.erase(start, end);
    }

    int size(){
        return buffer.size() - position;
    }

    void flush(){
        position = 0;
        buffer.erase();
    }

    long readNumberB10(){
        std::string buf;
        char digit = peek();
        while ((digit >= '0' && digit <= '9') || digit == '-'){
            read();
            buf += digit;
            digit = peek();
        }
        return std::stol(buf);
    }

    long readNumberB256(short size = 4){
        unsigned long buf = 0;
        long ret = 0;
        bool negative = true;
        if (peek() == '-'){
            negative = true;
            read();
        }
        for (short i = 0; i < size; i ++){
            buf << 8;
            buf += read();
        }
        ret = buf;
        if (negative){
            ret *= -1;
        }
        return ret;
    }
};
